import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Version } from '../../entities/version.entity';
import { License } from '../../entities/license.entity';
import { User } from '../../entities/user.entity';
import { DailyStats } from '../../entities/daily-stats.entity';
import { VersionFile } from '../../entities/version-file.entity';
import { AnalyticsService } from '../analytics/analytics.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { CreateVersionFileDto } from './dto/create-version-file.dto';
import { UpdateVersionFileDto } from './dto/update-version-file.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Version)
    private versionRepository: Repository<Version>,
    @InjectRepository(License)
    private licenseRepository: Repository<License>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(DailyStats)
    private dailyStatsRepository: Repository<DailyStats>,
    @InjectRepository(VersionFile)
    private versionFileRepository: Repository<VersionFile>,
    private analyticsService: AnalyticsService,
  ) {}

  async getDashboardAnalytics(days: number = 30) {
    return this.analyticsService.getDashboardAnalytics(days);
  }

  async getDevices(options: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    let query = this.licenseRepository
      .createQueryBuilder('license')
      .leftJoinAndSelect('license.user', 'user')
      .orderBy('license.created_at', 'DESC');

    if (search) {
      query = query.where(
        'license.device_fingerprint ILIKE :search OR user.email ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [licenses, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: licenses.map(license => ({
        id: license.id,
        deviceFingerprint: license.device_fingerprint,
        licenseType: license.type,
        active: license.active,
        expiresAt: license.expires_at,
        paymentStatus: license.payment_status,
        createdAt: license.created_at,
        user: {
          id: license.user.id,
          email: license.user.email,
          name: `${license.user.first_name} ${license.user.last_name}`,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getLicenses(options: { page: number; limit: number; type?: string; status?: string }) {
    const { page, limit, type, status } = options;
    const skip = (page - 1) * limit;

    let query = this.licenseRepository
      .createQueryBuilder('license')
      .leftJoinAndSelect('license.user', 'user')
      .orderBy('license.created_at', 'DESC');

    if (type) {
      query = query.andWhere('license.type = :type', { type });
    }

    if (status) {
      query = query.andWhere('license.payment_status = :status', { status });
    }

    const [licenses, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: licenses.map(license => ({
        id: license.id,
        licenseKey: license.license_key,
        deviceFingerprint: license.device_fingerprint,
        unlockCode: license.unlock_code,
        type: license.type,
        expiresAt: license.expires_at,
        active: license.active,
        paymentStatus: license.payment_status,
        amount: license.amount,
        paymentReference: license.payment_reference,
        createdAt: license.created_at,
        user: {
          id: license.user.id,
          email: license.user.email,
          name: `${license.user.first_name} ${license.user.last_name}`,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async createLicense(createLicenseDto: CreateLicenseDto) {
    const { user_id, ...licenseData } = createLicenseDto;

    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const license = this.licenseRepository.create({
      ...licenseData,
      user_id,
    });

    const savedLicense = await this.licenseRepository.save(license);
    
    return {
      id: savedLicense.id,
      licenseKey: savedLicense.license_key,
      deviceFingerprint: savedLicense.device_fingerprint,
      unlockCode: savedLicense.unlock_code,
      type: savedLicense.type,
      expiresAt: savedLicense.expires_at,
      active: savedLicense.active,
      paymentStatus: savedLicense.payment_status,
      amount: savedLicense.amount,
      createdAt: savedLicense.created_at,
    };
  }

  async updateLicense(id: string, updateLicenseDto: UpdateLicenseDto) {
    const license = await this.licenseRepository.findOne({ where: { id } });
    if (!license) {
      throw new NotFoundException('License not found');
    }

    await this.licenseRepository.update(id, updateLicenseDto);
    const updatedLicense = await this.licenseRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    return {
      id: updatedLicense.id,
      licenseKey: updatedLicense.license_key,
      deviceFingerprint: updatedLicense.device_fingerprint,
      unlockCode: updatedLicense.unlock_code,
      type: updatedLicense.type,
      expiresAt: updatedLicense.expires_at,
      active: updatedLicense.active,
      paymentStatus: updatedLicense.payment_status,
      amount: updatedLicense.amount,
      updatedAt: updatedLicense.updated_at,
    };
  }

  async deleteLicense(id: string) {
    const license = await this.licenseRepository.findOne({ where: { id } });
    if (!license) {
      throw new NotFoundException('License not found');
    }

    await this.licenseRepository.remove(license);
    
    return {
      message: 'License deleted successfully',
      id,
    };
  }

  async getVersions() {
    const versions = await this.versionRepository.find({
      order: { created_at: 'DESC' },
    });

    return versions.map(version => ({
      id: version.id,
      version: version.version,
      releaseNotes: version.release_notes,
      downloadUrl: version.download_url,
      mandatory: version.mandatory,
      active: version.active,
      fileSize: version.file_size,
      checksum: version.checksum,
      releaseDate: version.release_date,
      createdAt: version.created_at,
      updatedAt: version.updated_at,
    }));
  }

  async createVersion(createVersionDto: CreateVersionDto) {
    const existingVersion = await this.versionRepository.findOne({
      where: { version: createVersionDto.version },
    });

    if (existingVersion) {
      throw new BadRequestException('Version already exists');
    }

    const version = this.versionRepository.create(createVersionDto);
    const savedVersion = await this.versionRepository.save(version);

    return {
      id: savedVersion.id,
      version: savedVersion.version,
      releaseNotes: savedVersion.release_notes,
      downloadUrl: savedVersion.download_url,
      mandatory: savedVersion.mandatory,
      active: savedVersion.active,
      fileSize: savedVersion.file_size,
      checksum: savedVersion.checksum,
      releaseDate: savedVersion.release_date,
      createdAt: savedVersion.created_at,
    };
  }

  async updateVersion(id: string, updateVersionDto: UpdateVersionDto) {
    const version = await this.versionRepository.findOne({ where: { id } });
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    await this.versionRepository.update(id, updateVersionDto);
    const updatedVersion = await this.versionRepository.findOne({ where: { id } });

    return {
      id: updatedVersion.id,
      version: updatedVersion.version,
      releaseNotes: updatedVersion.release_notes,
      downloadUrl: updatedVersion.download_url,
      mandatory: updatedVersion.mandatory,
      active: updatedVersion.active,
      fileSize: updatedVersion.file_size,
      checksum: updatedVersion.checksum,
      releaseDate: updatedVersion.release_date,
      updatedAt: updatedVersion.updated_at,
    };
  }

  async toggleVersionStatus(id: string) {
    const version = await this.versionRepository.findOne({ where: { id } });
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    version.active = !version.active;
    await this.versionRepository.save(version);

    return {
      id: version.id,
      active: version.active,
      message: `Version ${version.active ? 'activated' : 'deactivated'} successfully`,
    };
  }

  async deleteVersion(id: string) {
    const version = await this.versionRepository.findOne({ where: { id } });
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    await this.versionRepository.remove(version);

    return {
      message: 'Version deleted successfully',
      id,
    };
  }

  async getVersionFiles(versionId: string) {
    const version = await this.versionRepository.findOne({ where: { id: versionId } });
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const files = await this.versionFileRepository.find({
      where: { version_id: versionId },
      order: { priority: 'ASC' },
    });

    return files.map(file => ({
      id: file.id,
      versionId: file.version_id,
      fileName: file.file_name,
      fileType: file.file_type,
      downloadUrl: file.download_url,
      destinationPath: file.destination_path,
      fileSize: file.file_size,
      checksum: file.checksum,
      mandatory: file.mandatory,
      active: file.active,
      description: file.description,
      priority: file.priority,
      createdAt: file.created_at,
      updatedAt: file.updated_at,
    }));
  }

  async createVersionFile(createVersionFileDto: CreateVersionFileDto) {
    const version = await this.versionRepository.findOne({
      where: { id: createVersionFileDto.version_id },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const versionFile = this.versionFileRepository.create(createVersionFileDto);
    const savedFile = await this.versionFileRepository.save(versionFile);

    return {
      id: savedFile.id,
      versionId: savedFile.version_id,
      fileName: savedFile.file_name,
      fileType: savedFile.file_type,
      downloadUrl: savedFile.download_url,
      destinationPath: savedFile.destination_path,
      fileSize: savedFile.file_size,
      checksum: savedFile.checksum,
      mandatory: savedFile.mandatory,
      active: savedFile.active,
      description: savedFile.description,
      priority: savedFile.priority,
      createdAt: savedFile.created_at,
    };
  }

  async updateVersionFile(id: string, updateVersionFileDto: UpdateVersionFileDto) {
    const versionFile = await this.versionFileRepository.findOne({ where: { id } });
    if (!versionFile) {
      throw new NotFoundException('Version file not found');
    }

    await this.versionFileRepository.update(id, updateVersionFileDto);
    const updatedFile = await this.versionFileRepository.findOne({ where: { id } });

    return {
      id: updatedFile.id,
      versionId: updatedFile.version_id,
      fileName: updatedFile.file_name,
      fileType: updatedFile.file_type,
      downloadUrl: updatedFile.download_url,
      destinationPath: updatedFile.destination_path,
      fileSize: updatedFile.file_size,
      checksum: updatedFile.checksum,
      mandatory: updatedFile.mandatory,
      active: updatedFile.active,
      description: updatedFile.description,
      priority: updatedFile.priority,
      updatedAt: updatedFile.updated_at,
    };
  }

  async deleteVersionFile(id: string) {
    const versionFile = await this.versionFileRepository.findOne({ where: { id } });
    if (!versionFile) {
      throw new NotFoundException('Version file not found');
    }

    await this.versionFileRepository.remove(versionFile);

    return {
      message: 'Version file deleted successfully',
      id,
    };
  }

  async toggleVersionFileStatus(id: string) {
    const versionFile = await this.versionFileRepository.findOne({ where: { id } });
    if (!versionFile) {
      throw new NotFoundException('Version file not found');
    }

    versionFile.active = !versionFile.active;
    await this.versionFileRepository.save(versionFile);

    return {
      id: versionFile.id,
      active: versionFile.active,
      message: `Version file ${versionFile.active ? 'activated' : 'deactivated'} successfully`,
    };
  }
}