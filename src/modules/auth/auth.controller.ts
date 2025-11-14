import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { MeResponseDto } from './dto/me-response.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'User registration',
    description: 'Register a new user account. Returns user information and JWT token for immediate authentication. Use the user.id from response for subsequent API calls.'
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. User can immediately use the access_token for authenticated requests.',
    type: RegisterResponseDto
  })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<RegisterResponseDto> {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user credentials. Returns JWT token and user information. Use the user.id from response for user-specific operations like profile updates.'
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Use access_token for authenticated requests and user.id for user-specific operations.',
    type: LoginResponseDto
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(req.user);
  }

  @ApiOperation({
    summary: 'Get current user information',
    description: 'Retrieve information about the currently authenticated user. Use the returned id for user-specific operations like profile updates.'
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully. Use id field for user-specific operations.',
    type: MeResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req): MeResponseDto {
    return {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      role: req.user.role,
      lastLogin: req.user.last_login,
    };
  }

  @ApiOperation({ summary: 'Admin logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return {
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    };
  }
}
