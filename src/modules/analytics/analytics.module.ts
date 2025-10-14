import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { UsageAnalytics } from '../../entities/usage-analytics.entity';
import { DailyStats } from '../../entities/daily-stats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsageAnalytics, DailyStats])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}