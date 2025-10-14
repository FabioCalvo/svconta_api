import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { CreateVersionFileDto } from './dto/create-version-file.dto';
import { UpdateVersionFileDto } from './dto/update-version-file.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @ApiOperation({ summary: 'Get dashboard analytics' })
  @ApiResponse({ status: 200, description: 'Dashboard analytics retrieved' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  @Get('dashboard-analytics')
  async getDashboardAnalytics(@Query('days') days?: number) {
    return this.adminService.getDashboardAnalytics(days ? parseInt(days.toString()) : 30);
  }

  @ApiOperation({ summary: 'Get all devices with pagination and search' })
  @ApiResponse({ status: 200, description: 'Devices retrieved' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  @Get('devices')
  async getDevices(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getDevices({
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 10,
      search,
    });
  }

  @ApiOperation({ summary: 'Get all licenses with filtering' })
  @ApiResponse({ status: 200, description: 'Licenses retrieved' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @Get('licenses')
  async getLicenses(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getLicenses({
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 10,
      type,
      status,
    });
  }

  @ApiOperation({ summary: 'Create new license' })
  @ApiResponse({ status: 201, description: 'License created successfully' })
  @Post('licenses')
  async createLicense(@Body() createLicenseDto: CreateLicenseDto) {
    return this.adminService.createLicense(createLicenseDto);
  }

  @ApiOperation({ summary: 'Update existing license' })
  @ApiResponse({ status: 200, description: 'License updated successfully' })
  @Put('licenses/:id')
  async updateLicense(@Param('id') id: string, @Body() updateLicenseDto: UpdateLicenseDto) {
    return this.adminService.updateLicense(id, updateLicenseDto);
  }

  @ApiOperation({ summary: 'Delete license' })
  @ApiResponse({ status: 200, description: 'License deleted successfully' })
  @Delete('licenses/:id')
  async deleteLicense(@Param('id') id: string) {
    return this.adminService.deleteLicense(id);
  }

  @ApiOperation({ summary: 'Get all versions' })
  @ApiResponse({ status: 200, description: 'Versions retrieved' })
  @Get('versions')
  async getVersions() {
    return this.adminService.getVersions();
  }

  @ApiOperation({ summary: 'Create new version' })
  @ApiResponse({ status: 201, description: 'Version created successfully' })
  @Post('versions')
  async createVersion(@Body() createVersionDto: CreateVersionDto) {
    return this.adminService.createVersion(createVersionDto);
  }

  @ApiOperation({ summary: 'Update existing version' })
  @ApiResponse({ status: 200, description: 'Version updated successfully' })
  @Put('versions/:id')
  async updateVersion(@Param('id') id: string, @Body() updateVersionDto: UpdateVersionDto) {
    return this.adminService.updateVersion(id, updateVersionDto);
  }

  @ApiOperation({ summary: 'Toggle version active status' })
  @ApiResponse({ status: 200, description: 'Version status toggled successfully' })
  @Patch('versions/:id/toggle')
  async toggleVersionStatus(@Param('id') id: string) {
    return this.adminService.toggleVersionStatus(id);
  }

  @ApiOperation({ summary: 'Delete version' })
  @ApiResponse({ status: 200, description: 'Version deleted successfully' })
  @Delete('versions/:id')
  async deleteVersion(@Param('id') id: string) {
    return this.adminService.deleteVersion(id);
  }

  @ApiOperation({ summary: 'Get all files for a version' })
  @ApiResponse({ status: 200, description: 'Version files retrieved' })
  @ApiParam({ name: 'versionId', description: 'Version ID', type: 'string' })
  @Get('versions/:versionId/files')
  async getVersionFiles(@Param('versionId') versionId: string) {
    return this.adminService.getVersionFiles(versionId);
  }

  @ApiOperation({ summary: 'Create new version file' })
  @ApiResponse({ status: 201, description: 'Version file created successfully' })
  @Post('version-files')
  async createVersionFile(@Body() createVersionFileDto: CreateVersionFileDto) {
    return this.adminService.createVersionFile(createVersionFileDto);
  }

  @ApiOperation({ summary: 'Update version file' })
  @ApiResponse({ status: 200, description: 'Version file updated successfully' })
  @ApiParam({ name: 'id', description: 'Version file ID', type: 'string' })
  @Put('version-files/:id')
  async updateVersionFile(@Param('id') id: string, @Body() updateVersionFileDto: UpdateVersionFileDto) {
    return this.adminService.updateVersionFile(id, updateVersionFileDto);
  }

  @ApiOperation({ summary: 'Toggle version file active status' })
  @ApiResponse({ status: 200, description: 'Version file status toggled successfully' })
  @ApiParam({ name: 'id', description: 'Version file ID', type: 'string' })
  @Patch('version-files/:id/toggle')
  async toggleVersionFileStatus(@Param('id') id: string) {
    return this.adminService.toggleVersionFileStatus(id);
  }

  @ApiOperation({ summary: 'Delete version file' })
  @ApiResponse({ status: 200, description: 'Version file deleted successfully' })
  @ApiParam({ name: 'id', description: 'Version file ID', type: 'string' })
  @Delete('version-files/:id')
  async deleteVersionFile(@Param('id') id: string) {
    return this.adminService.deleteVersionFile(id);
  }
}