import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { UsageAnalytics, AnalyticsEventType } from '../../entities/usage-analytics.entity';
import { DailyStats } from '../../entities/daily-stats.entity';
import { TrackEventDto } from './dto/track-event.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UsageAnalytics)
    private usageAnalyticsRepository: Repository<UsageAnalytics>,
    @InjectRepository(DailyStats)
    private dailyStatsRepository: Repository<DailyStats>,
  ) {}

  async trackEvent(trackEventDto: TrackEventDto, request: Request) {
    const {
      user_id,
      license_id,
      session_id,
      event_type,
      event_name,
      event_data,
      device_fingerprint,
      app_version,
    } = trackEventDto;

    const analyticsEvent = this.usageAnalyticsRepository.create({
      user_id,
      license_id,
      session_id,
      event_type,
      event_name,
      event_data,
      device_fingerprint,
      app_version,
      ip_address: request.ip,
      country: request.headers['cf-ipcountry'] as string || null,
      city: request.headers['cf-ipcity'] as string || null,
    });

    await this.usageAnalyticsRepository.save(analyticsEvent);

    // Update daily stats asynchronously
    this.updateDailyStats(event_type);

    return {
      success: true,
      message: 'Event tracked successfully',
      timestamp: analyticsEvent.created_at,
    };
  }

  private async updateDailyStats(eventType: AnalyticsEventType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      let dailyStat = await this.dailyStatsRepository.findOne({
        where: { date: today },
      });

      if (!dailyStat) {
        dailyStat = this.dailyStatsRepository.create({
          date: today,
        });
      }

      // Update relevant counters based on event type
      switch (eventType) {
        case AnalyticsEventType.APP_START:
          dailyStat.app_sessions++;
          break;
        case AnalyticsEventType.LICENSE_CHECK:
          dailyStat.license_validations++;
          break;
        case AnalyticsEventType.VERSION_CHECK:
          dailyStat.version_checks++;
          break;
      }

      await this.dailyStatsRepository.save(dailyStat);
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  }

  async getDashboardAnalytics(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyStats = await this.dailyStatsRepository
      .createQueryBuilder('stats')
      .where('stats.date >= :startDate AND stats.date <= :endDate', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })
      .orderBy('stats.date', 'ASC')
      .getMany();

    // Calculate totals
    const totals = dailyStats.reduce((acc, stat) => ({
      activeUsers: acc.activeUsers + stat.active_users,
      newLicenses: acc.newLicenses + stat.new_licenses,
      licenseValidations: acc.licenseValidations + stat.license_validations,
      versionChecks: acc.versionChecks + stat.version_checks,
      appSessions: acc.appSessions + stat.app_sessions,
      totalSessionDuration: acc.totalSessionDuration + stat.total_session_duration,
    }), {
      activeUsers: 0,
      newLicenses: 0,
      licenseValidations: 0,
      versionChecks: 0,
      appSessions: 0,
      totalSessionDuration: 0,
    });

    return {
      period: { startDate, endDate, days },
      totals,
      dailyStats: dailyStats.map(stat => ({
        date: stat.date,
        activeUsers: stat.active_users,
        newLicenses: stat.new_licenses,
        licenseValidations: stat.license_validations,
        versionChecks: stat.version_checks,
        appSessions: stat.app_sessions,
        totalSessionDuration: stat.total_session_duration,
      })),
    };
  }
}