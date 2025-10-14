import { Injectable, HttpStatus } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private connection: Connection) {}

  async checkHealth() {
    const checks = {
      database: false,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    try {
      // Check database connection
      await this.connection.query('SELECT 1');
      checks.database = true;

      return {
        status: 'healthy',
        statusCode: HttpStatus.OK,
        checks,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        checks,
        error: error.message,
      };
    }
  }
}