import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User, CreateUserDto } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers() {
    try {
      return this.usersService.getAllUsers();
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  @Get(':id')
  getUserById(@Param('id') id: string): User {
    return this.usersService.getUserById(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() createUserDto: CreateUserDto): User {
    return this.usersService.createUser(createUserDto);
  }

  @Put('revalidate')
  @HttpCode(HttpStatus.OK)
  updateAllUsers() {
    return this.usersService.updateAllUsers();
  }
}
