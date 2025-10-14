import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Version } from '../../entities/version.entity';
import { License } from '../../entities/license.entity';
import { User } from '../../entities/user.entity';
import { DailyStats } from '../../entities/daily-stats.entity';
import { VersionFile } from '../../entities/version-file.entity';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Version, License, User, DailyStats, VersionFile]),
    AnalyticsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}