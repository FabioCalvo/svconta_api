import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Version } from '../../entities/version.entity';
import { VersionCheck } from '../../entities/version-check.entity';
import { VersionFile } from '../../entities/version-file.entity';
import { CheckVersionDto } from './dto/check-version.dto';

@Injectable()
export class VersionService {
  constructor(
    @InjectRepository(Version)
    private versionRepository: Repository<Version>,
    @InjectRepository(VersionCheck)
    private versionCheckRepository: Repository<VersionCheck>,
    @InjectRepository(VersionFile)
    private versionFileRepository: Repository<VersionFile>,
  ) {}

  async checkVersion(checkVersionDto: CheckVersionDto, request: Request) {
    const { current_version, device_fingerprint, user_id } = checkVersionDto;

    const latestVersion = await this.versionRepository.findOne({
      where: { active: true },
      order: { created_at: 'DESC' },
    });

    if (!latestVersion) {
      return {
        updateAvailable: false,
        currentVersion: current_version,
        message: 'No versions available',
      };
    }

    const updateAvailable = this.compareVersions(current_version, latestVersion.version) < 0;

    const versionCheck = this.versionCheckRepository.create({
      user_id: user_id || null,
      current_version,
      latest_version: latestVersion.version,
      update_available: updateAvailable,
      device_fingerprint: device_fingerprint || null,
      ip_address: request.ip,
      user_agent: request.headers['user-agent'],
      country: request.headers['cf-ipcountry'] as string || null,
      city: request.headers['cf-ipcity'] as string || null,
    });

    await this.versionCheckRepository.save(versionCheck);

    let files = [];
    if (updateAvailable) {
      const versionFiles = await this.versionFileRepository.find({
        where: { version_id: latestVersion.id, active: true },
        order: { priority: 'ASC' },
      });

      files = versionFiles.map(file => ({
        id: file.id,
        fileName: file.file_name,
        fileType: file.file_type,
        downloadUrl: file.download_url,
        destinationPath: file.destination_path,
        fileSize: file.file_size,
        checksum: file.checksum,
        mandatory: file.mandatory,
        description: file.description,
        priority: file.priority,
      }));
    }

    return {
      updateAvailable,
      currentVersion: current_version,
      latestVersion: latestVersion.version,
      mandatory: updateAvailable ? latestVersion.mandatory : false,
      downloadUrl: updateAvailable ? latestVersion.download_url : null,
      releaseNotes: updateAvailable ? latestVersion.release_notes : null,
      fileSize: updateAvailable ? latestVersion.file_size : null,
      checksum: updateAvailable ? latestVersion.checksum : null,
      requiredVersion: updateAvailable ? latestVersion.required_version : null,
      releaseDate: updateAvailable ? latestVersion.release_date : null,
      files,
    };
  }

  async getAllVersions() {
    const versions = await this.versionRepository.find({
      where: { active: true },
      order: { created_at: 'DESC' },
      select: [
        'id',
        'version',
        'release_date',
        'download_url',
        'release_notes',
        'mandatory',
        'active',
        'file_size',
        'checksum',
        'required_version',
        'created_at',
      ],
    });

    return versions.map(version => ({
      id: version.id,
      version: version.version,
      releaseDate: version.release_date,
      downloadUrl: version.download_url,
      releaseNotes: version.release_notes,
      mandatory: version.mandatory,
      active: version.active,
      fileSize: version.file_size,
      checksum: version.checksum,
      requiredVersion: version.required_version,
      createdAt: version.created_at,
    }));
  }

  async getVersionFiles(versionId: string) {
    const files = await this.versionFileRepository.find({
      where: { version_id: versionId, active: true },
      order: { priority: 'ASC' },
    });

    return files.map(file => ({
      id: file.id,
      fileName: file.file_name,
      fileType: file.file_type,
      downloadUrl: file.download_url,
      destinationPath: file.destination_path,
      fileSize: file.file_size,
      checksum: file.checksum,
      mandatory: file.mandatory,
      description: file.description,
      priority: file.priority,
      createdAt: file.created_at,
    }));
  }

  private compareVersions(version1: string, version2: string): number {
    const v1parts = version1.split('.').map(n => parseInt(n, 10));
    const v2parts = version2.split('.').map(n => parseInt(n, 10));

    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;

      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }

    return 0;
  }
}