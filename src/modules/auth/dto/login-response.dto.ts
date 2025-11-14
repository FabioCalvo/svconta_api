import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../entities/user.entity';

class LoginUserDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID - use this for user-specific operations like profile updates'
  })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role: UserRole;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJzdWIiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE2OTk5MDM0MDAsImV4cCI6MTY5OTkwNzAwMH0.signature',
    description: 'JWT access token for authentication. Contains user ID in "sub" field.'
  })
  access_token: string;

  @ApiProperty({
    type: LoginUserDto,
    description: 'User information including ID for subsequent API calls'
  })
  user: LoginUserDto;
}
