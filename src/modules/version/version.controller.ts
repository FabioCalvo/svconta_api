import { Controller, Get, Query, Req, UseGuards, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { VersionService } from './version.service';
import { CheckVersionDto } from './dto/check-version.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Versions')
@Controller()
export class VersionController {
  constructor(private versionService: VersionService) {}

  @ApiOperation({ summary: 'Check for application updates' })
  @ApiResponse({ status: 200, description: 'Version check completed' })
  @ApiQuery({ name: 'current_version', required: true, example: '1.0.0' })
  @ApiQuery({ name: 'device_fingerprint', required: false })
  @ApiQuery({ name: 'user_id', required: false })
  @Get('check-version')
  async checkVersion(
    @Query() query: CheckVersionDto,
    @Req() request: Request,
  ) {
    return this.versionService.checkVersion(query, request);
  }

  @ApiOperation({ summary: 'Get all available versions' })
  @ApiResponse({ status: 200, description: 'List of all versions' })
  @Get('versions')
  async getAllVersions() {
    return this.versionService.getAllVersions();
  }

  @ApiOperation({ summary: 'Get all files for a specific version' })
  @ApiResponse({ status: 200, description: 'List of version files' })
  @ApiParam({ name: 'versionId', description: 'Version ID', type: 'string' })
  @Get('versions/:versionId/files')
  async getVersionFiles(@Param('versionId') versionId: string) {
    return this.versionService.getVersionFiles(versionId);
  }
}