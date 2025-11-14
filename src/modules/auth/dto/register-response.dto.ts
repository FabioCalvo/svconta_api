import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class RegisterResponseDto {
  @ApiProperty({
    type: UserResponseDto,
    description: 'Created user information including ID for subsequent API calls'
  })
  user: UserResponseDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJzdWIiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE2OTk5MDM0MDAsImV4cCI6MTY5OTkwNzAwMH0.signature',
    description: 'JWT access token for immediate authentication. Contains user ID in "sub" field.'
  })
  access_token: string;
}
