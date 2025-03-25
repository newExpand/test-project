import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('_limit') limit?: number
  ): Promise<Omit<UserDto, 'password'>[]> {
    const users = await this.usersService.findAll(limit);
    // 비밀번호는 응답에서 제외
    return users.map(
      ({ password, ...userWithoutPassword }) => userWithoutPassword
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Omit<UserDto, 'password'>> {
    const user = await this.usersService.findById(+id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // 비밀번호는 응답에서 제외
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
