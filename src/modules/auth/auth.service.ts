import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async onModuleInit() {
    // Delay to ensure repository is fully initialized
    setTimeout(() => this.createDefaultAdmin().catch(err =>
      console.log('Default admin creation skipped (may already exist)')
    ), 1000);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email, active: true }
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(createUserDto: CreateUserDto): Promise<{ user: UserResponseDto; access_token: string }> {
    // Create the user using the users service
    const user = await this.usersService.create(createUserDto);

    // Generate JWT token for immediate login
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user,
      access_token,
    };
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role
    };

    // Update last login
    await this.userRepository.update(user.id, {
      last_login: new Date(),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    };
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id, active: true }
    });
  }

  private async createDefaultAdmin() {
    const adminExists = await this.userRepository.findOne({
      where: { role: UserRole.SUPER_ADMIN }
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(
        process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', 
        10
      );

      const admin = this.userRepository.create({
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@svconta.com',
        password: hashedPassword,
        first_name: 'Super',
        last_name: 'Admin',
        role: UserRole.SUPER_ADMIN,
        active: true,
      });

      await this.userRepository.save(admin);
      console.log('Default admin user created');
    }
  }
}
