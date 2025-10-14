import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      // Fallback to SQLite if DATABASE_URL is not set
      // This retains your original logic for WebContainer environments.
      return {
        type: 'better-sqlite3',
        database: 'sv_conta.db',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      };
    }

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    return {
      type: 'postgres',
      url: databaseUrl, // Use the DATABASE_URL directly
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: !isProduction,
      logging: !isProduction,
      // For many cloud providers (like Heroku, Neon, etc.), SSL is required
      // and can be configured like this. rejectUnauthorized is often
      // needed for self-signed certificates.
      ssl: isProduction ? { rejectUnauthorized: false } : false, // [1.4.4]
    };
  }
}
