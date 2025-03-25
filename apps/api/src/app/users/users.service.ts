import { Injectable, NotFoundException } from '@nestjs/common';
import { UserDto } from './users.dto';

@Injectable()
export class UsersService {
  private readonly baseUsers = [
    {
      userId: 1,
      username: 'john',
      password: 'password123',
      name: '존 도우',
      email: 'john@example.com',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'password456',
      name: '마리아 스미스',
      email: 'maria@example.com',
    },
    {
      userId: 3,
      username: 'admin',
      password: 'admin123',
      name: '관리자',
      email: 'admin@example.com',
    },
    {
      userId: 4,
      username: 'user1',
      password: 'user123',
      name: '사용자1',
      email: 'user1@example.com',
    },
    {
      userId: 5,
      username: 'user2',
      password: 'user456',
      name: '사용자2',
      email: 'user2@example.com',
    },
  ];

  async findAll(limit?: number): Promise<UserDto[]> {
    // 현재 시간 기반 타임스탬프 생성
    const timestamp = new Date().toLocaleTimeString('ko-KR');

    // 동적으로 데이터 생성 (매번 약간씩 다른 데이터 반환)
    const users = this.baseUsers.map((user) => ({
      ...user,
      // 이름에 타임스탬프 추가하여 변경점 확인 가능
      name: `${user.name} (${timestamp})`,
      // 랜덤 상태 정보 추가
      status: ['온라인', '오프라인', '자리비움'][Math.floor(Math.random() * 3)],
    }));

    if (limit) {
      return users.slice(0, limit);
    }
    return users;
  }

  async findOne(username: string): Promise<UserDto | undefined> {
    const baseUser = this.baseUsers.find((user) => user.username === username);
    if (!baseUser) return undefined;

    // 현재 시간 기반 타임스탬프 생성
    const timestamp = new Date().toLocaleTimeString('ko-KR');

    return {
      ...baseUser,
      name: `${baseUser.name} (${timestamp})`,
      status: ['온라인', '오프라인', '자리비움'][Math.floor(Math.random() * 3)],
    };
  }

  async findById(userId: number): Promise<UserDto | undefined> {
    const baseUser = this.baseUsers.find((user) => user.userId === userId);
    if (!baseUser) return undefined;

    // 현재 시간 기반 타임스탬프 생성
    const timestamp = new Date().toLocaleTimeString('ko-KR');

    return {
      ...baseUser,
      name: `${baseUser.name} (${timestamp})`,
      status: ['온라인', '오프라인', '자리비움'][Math.floor(Math.random() * 3)],
    };
  }
}
