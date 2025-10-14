import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { License, LicenseType, PaymentStatus } from '../../entities/license.entity';
import { LicenseValidation, ValidationResult } from '../../entities/license-validation.entity';
import { User, UserRole } from '../../entities/user.entity';
import { ProcessLicenseDto } from './dto/process-license.dto';
import { ValidateLicenseDto } from './dto/validate-license.dto';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';

@Injectable()
export class LicenseService {
  constructor(
    @InjectRepository(License)
    private licenseRepository: Repository<License>,
    @InjectRepository(LicenseValidation)
    private licenseValidationRepository: Repository<LicenseValidation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async processLicense(processLicenseDto: ProcessLicenseDto, request: Request) {
    const { device_fingerprint, customer_email, customer_name, license_type = LicenseType.TRIAL } = processLicenseDto;

    // Validate device fingerprint format
    if (!this.validateDeviceFingerprintFormat(device_fingerprint)) {
      throw new BadRequestException('Invalid device fingerprint format. Expected: ##########-######');
    }

    // Check if license already exists for this device
    const existingLicense = await this.licenseRepository.findOne({
      where: { device_fingerprint, active: true },
    });

    if (existingLicense) {
      return {
        success: false,
        message: 'License already exists for this device',
        unlockCode: existingLicense.unlock_code,
      };
    }

    // Find or create user
    let user = await this.userRepository.findOne({
      where: { email: customer_email },
    });

    if (!user) {
      user = this.userRepository.create({
        email: customer_email,
        first_name: customer_name.split(' ')[0] || 'Customer',
        last_name: customer_name.split(' ').slice(1).join(' ') || '',
        role: UserRole.CUSTOMER,
        password: 'N/A', // Customer users don't need password for admin login
      });
      user = await this.userRepository.save(user);
    }

    // Generate unlock code
    const unlockCode = this.generateUnlockCode(device_fingerprint);

    // Create license
    const license = this.licenseRepository.create({
      license_key: uuidv4(),
      device_fingerprint,
      unlock_code: unlockCode,
      type: license_type,
      expires_at: this.calculateExpirationDate(license_type),
      active: true,
      payment_status: PaymentStatus.PENDING,
      user_id: user.id,
    });

    await this.licenseRepository.save(license);

    return {
      success: true,
      message: 'License processed successfully',
      unlockCode: unlockCode,
      expiresAt: license.expires_at,
      licenseType: license.type,
    };
  }

  async validateLicense(validateLicenseDto: ValidateLicenseDto, request: Request) {
    const { unlock_code, device_fingerprint } = validateLicenseDto;

    let validationResult: ValidationResult;
    let errorMessage: string | null = null;
    let license: License | null = null;

    try {
      // Find license by unlock code and device fingerprint
      license = await this.licenseRepository.findOne({
        where: { 
          unlock_code, 
          device_fingerprint,
        },
        relations: ['user'],
      });

      if (!license) {
        validationResult = ValidationResult.NOT_FOUND;
        errorMessage = 'License not found';
      } else if (!license.active) {
        validationResult = ValidationResult.INVALID;
        errorMessage = 'License is inactive';
      } else if (new Date() > license.expires_at) {
        validationResult = ValidationResult.EXPIRED;
        errorMessage = 'License has expired';
      } else {
        validationResult = ValidationResult.VALID;
      }
    } catch (error) {
      validationResult = ValidationResult.INVALID;
      errorMessage = 'Validation error occurred';
    }

    // Log validation attempt
    const validation = this.licenseValidationRepository.create({
      license_id: license?.id || null,
      unlock_code,
      device_fingerprint,
      result: validationResult,
      error_message: errorMessage,
      ip_address: request.ip,
      user_agent: request.headers['user-agent'],
      country: request.headers['cf-ipcountry'] as string || null,
      city: request.headers['cf-ipcity'] as string || null,
    });

    await this.licenseValidationRepository.save(validation);

    const response: any = {
      valid: validationResult === ValidationResult.VALID,
      result: validationResult,
    };

    if (validationResult === ValidationResult.VALID && license) {
      response.license = {
        type: license.type,
        expiresAt: license.expires_at,
        paymentStatus: license.payment_status,
      };
      response.user = {
        id: license.user.id,
        email: license.user.email,
        name: `${license.user.first_name} ${license.user.last_name}`,
      };
    } else {
      response.error = errorMessage;
    }

    return response;
  }

  async getUserDevices(userId: string) {
    const licenses = await this.licenseRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    return licenses.map(license => ({
      id: license.id,
      deviceFingerprint: license.device_fingerprint,
      licenseType: license.type,
      active: license.active,
      expiresAt: license.expires_at,
      paymentStatus: license.payment_status,
      createdAt: license.created_at,
    }));
  }

  private validateDeviceFingerprintFormat(fingerprint: string): boolean {
    // Format: ##########-######
    const pattern = /^\d{10}-\d{6}$/;
    return pattern.test(fingerprint);
  }

  private generateUnlockCode(deviceFingerprint: string): string {
    // Mock algorithm - replace with your actual algorithm
    // This should generate a 17-digit unlock code based on device fingerprint
    const timestamp = Date.now().toString();
    const fingerHash = this.simpleHash(deviceFingerprint);
    const combined = timestamp + fingerHash;
    
    // Take first 17 digits
    return combined.substring(0, 17).padEnd(17, '0');
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  private calculateExpirationDate(licenseType: LicenseType): Date {
    const now = moment();
    
    switch (licenseType) {
      case LicenseType.TRIAL:
        return now.add(30, 'days').toDate();
      case LicenseType.BASIC:
        return now.add(1, 'year').toDate();
      case LicenseType.PROFESSIONAL:
        return now.add(1, 'year').toDate();
      case LicenseType.ENTERPRISE:
        return now.add(2, 'years').toDate();
      default:
        return now.add(30, 'days').toDate();
    }
  }
}