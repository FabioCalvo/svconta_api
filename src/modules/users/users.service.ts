import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.CUSTOMER, // Default role for registration
      active: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Return user data without password
    const { password, ...userResponse } = savedUser;
    return userResponse as UserResponseDto;
  }

  async findAll(options: { page?: number; limit?: number; search?: string } = {}): Promise<{
    data: UserResponseDto[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { page = 1, limit = 10, search } = options;
    const skip = (page - 1) * limit;

    let query = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.created_at', 'DESC');

    if (search) {
      query = query.where(
        'user.email ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [users, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: users.map(user => {
        const { password, ...userResponse } = user;
        return userResponse as UserResponseDto;
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id, active: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userResponse } = user;
    return userResponse as UserResponseDto;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id, active: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if email is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, updateUserDto);

    const updatedUser = await this.userRepository.findOne({
      where: { id }
    });

    const { password, ...userResponse } = updatedUser;
    return userResponse as UserResponseDto;
  }

  async remove(id: string): Promise<{ message: string; id: string }> {
    const user = await this.userRepository.findOne({
      where: { id, active: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by setting active to false
    await this.userRepository.update(id, { active: false });

    return {
      message: 'User deactivated successfully',
      id,
    };
  }

  async toggleStatus(id: string): Promise<{ id: string; active: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.active = !user.active;
    await this.userRepository.save(user);

    return {
      id: user.id,
      active: user.active,
      message: `User ${user.active ? 'activated' : 'deactivated'} successfully`,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, active: true }
    });
  }
}
