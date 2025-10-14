import { Controller, Post, Body, Req, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { LicenseService } from './license.service';
import { ProcessLicenseDto } from './dto/process-license.dto';
import { ValidateLicenseDto } from './dto/validate-license.dto';

@ApiTags('Licenses')
@Controller()
export class LicenseController {
  constructor(private licenseService: LicenseService) {}

  @ApiOperation({ summary: 'Process license and generate unlock code' })
  @ApiResponse({ status: 200, description: 'License processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid license data' })
  @Post('license/process')
  async processLicense(
    @Body() processLicenseDto: ProcessLicenseDto,
    @Req() request: Request,
  ) {
    return this.licenseService.processLicense(processLicenseDto, request);
  }

  @ApiOperation({ summary: 'Validate license with unlock code' })
  @ApiResponse({ status: 200, description: 'License validation result' })
  @Post('license/validate')
  async validateLicense(
    @Body() validateLicenseDto: ValidateLicenseDto,
    @Req() request: Request,
  ) {
    return this.licenseService.validateLicense(validateLicenseDto, request);
  }

  @ApiOperation({ summary: 'Get user devices' })
  @ApiResponse({ status: 200, description: 'User devices retrieved' })
  @Get('users/:user_id/devices')
  async getUserDevices(@Param('user_id') userId: string) {
    return this.licenseService.getUserDevices(userId);
  }
}