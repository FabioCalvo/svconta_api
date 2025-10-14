import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionController } from './version.controller';
import { VersionService } from './version.service';
import { Version } from '../../entities/version.entity';
import { VersionCheck } from '../../entities/version-check.entity';
import { VersionFile } from '../../entities/version-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Version, VersionCheck, VersionFile])],
  controllers: [VersionController],
  providers: [VersionService],
  exports: [VersionService],
})
export class VersionModule {}