import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: 'Smith' })
  second_last_name?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role: UserRole;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: '2023-11-13T18:30:00.000Z' })
  last_login?: Date;

  @ApiProperty({ example: '+1234567890' })
  phone?: string;

  @ApiProperty({ example: 'ABC Company' })
  company?: string;

  @ApiProperty({ example: '123456789' })
  personal_id?: string;

  @ApiProperty({ example: '2023-11-13T18:30:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2023-11-13T18:30:00.000Z' })
  updated_at: Date;
}
