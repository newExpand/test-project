import { Injectable, NotFoundException } from '@nestjs/common';
import { User, CreateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  // 마지막 요청 ID (로깅용)
  private lastRequestId = '';

  // 테스트를 위한 기본 사용자 데이터
  private users: User[] = [
    {
      id: 1,
      name: '홍길동',
      email: 'hong@example.com',
    },
    {
      id: 2,
      name: '김철수',
      email: 'kim@example.com',
    },
    {
      id: 3,
      name: '이영희',
      email: 'lee@example.com',
    },
    {
      id: 4,
      name: '박지민',
      email: 'park@example.com',
    },
    {
      id: 5,
      name: '최유진',
      email: 'choi@example.com',
    },
    {
      id: 6,
      name: '정민수',
      email: 'jung@example.com',
    },
  ];

  constructor() {
    console.log('UsersService 초기화됨 - Next.js 캐싱 테스트용 v4 (완전 랜덤)');
  }

  // 모든 사용자 조회 (매 요청마다 새로운 랜덤 순서와 타임스탬프 반환)
  getAllUsers(): { users: User[]; lastUpdated: string; timestamp: string } {
    // 현재 요청의 타임스탬프와 식별자 (로깅용)
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    const lastUpdated = now.toISOString();

    this.lastRequestId = `req-${Math.floor(
      Math.random() * 10000
    )}-${timestamp}`;

    // 매 요청마다 새롭게 셔플된 사용자 목록 생성
    const shuffledUsers = this.shuffleArray([...this.users]);

    console.log(
      `[getAllUsers 호출] 요청 ID: ${this.lastRequestId} - 완전히 새로운 랜덤 데이터 반환`
    );

    // 새로 셔플된 데이터와 현재 타임스탬프 반환
    return {
      users: shuffledUsers,
      lastUpdated: lastUpdated, // 매 요청마다 새로 생성
      timestamp: timestamp,
    };
  }

  getUserById(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`사용자 ID ${id}를 찾을 수 없습니다.`);
    }
    return user;
  }

  createUser(createUserDto: CreateUserDto): User {
    const newUser: User = {
      id: this.users.length + 1,
      ...createUserDto,
    };
    this.users.push(newUser);
    return newUser;
  }

  // 모든 사용자 데이터 수동 업데이트 (재검증 테스트용)
  updateAllUsers(): { users: User[]; lastUpdated: string; timestamp: string } {
    const now = new Date();
    console.log(`[수동 업데이트] 데이터 갱신됨: ${now.toISOString()}`);

    // 최신 데이터 반환
    return this.getAllUsers();
  }

  // 배열 랜덤 섞기 (Fisher-Yates 알고리즘)
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
