import { Injectable } from '@nestjs/common';
import { User } from './users.model';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
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

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
