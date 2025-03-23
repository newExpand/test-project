import { Injectable } from '@nestjs/common';
import { UserDto } from './users.dto';

@Injectable()
export class UsersService {
  private readonly users: UserDto[] = [
    {
      userId: 1,
      username: 'john',
      password: 'password123',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'password456',
    },
  ];

  async findOne(username: string): Promise<UserDto | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
