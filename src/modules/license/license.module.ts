import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicenseController } from './license.controller';
import { LicenseService } from './license.service';
import { License } from '../../entities/license.entity';
import { LicenseValidation } from '../../entities/license-validation.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([License, LicenseValidation, User])],
  controllers: [LicenseController],
  providers: [LicenseService],
  exports: [LicenseService],
})
export class LicenseModule {}