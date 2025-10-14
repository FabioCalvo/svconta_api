import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Track usage event' })
  @ApiResponse({ status: 200, description: 'Event tracked successfully' })
  @Post('track')
  async trackEvent(
    @Body() trackEventDto: TrackEventDto,
    @Req() request: Request,
  ) {
    return this.analyticsService.trackEvent(trackEventDto, request);
  }
}