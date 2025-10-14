import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { VersionModule } from './modules/version/version.module';
import { LicenseModule } from './modules/license/license.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthModule } from './modules/health/health.module';
import { AdminModule } from './modules/admin/admin.module';

// Configuration
import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
     TypeOrmModule.forRootAsync({
      imports: [ConfigModule], 
      useClass: DatabaseConfig,
    }), 

    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    //     const databaseUrl = configService.get<string>('DATABASE_URL');

    //     // **CRITICAL DIAGNOSTIC STEP**
    //     // This will crash the app if the .env file is not being loaded.
    //     if (!databaseUrl) {
    //       throw new Error('DATABASE_URL environment variable is not set or loaded');
    //     }

    //     const isProduction = configService.get<string>('NODE_ENV') === 'production';

    //     return {
    //       type: 'postgres',
    //       url: databaseUrl,
    //       entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    //       synchronize: !isProduction, // Disable synchronize in production
    //       logging: !isProduction,
    //       ssl: isProduction ? { rejectUnauthorized: false } : false,
    //     };
    //   },
    // }),
     
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
    AuthModule,
    VersionModule,
    LicenseModule,
    AnalyticsModule,
    HealthModule,
    AdminModule,
  ],
})
export class AppModule {}