import { Injectable, NotFoundException } from '@nestjs/common';
import { User, CreateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  // 마지막 데이터 업데이트 시간
  private lastUpdated: string = new Date().toISOString();

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

  // 사용자 목록 셔플 상태 (고정된 순서)
  private shuffledUsers: User[] = [];

  constructor() {
    console.log('UsersService 초기화됨 - Next.js 캐싱 테스트용 v2');

    // 초기 셔플
    this.shuffleUsersOnce();

    // 30초마다 사용자 데이터 자동 업데이트 (Next.js의 ISR 테스트용)
    setInterval(() => {
      this.updateAllUsersData();
    }, 30000); // 30초마다 업데이트
  }

  // 모든 사용자 조회 (고정된 순서로 반환 - 캐싱 가능)
  getAllUsers(): { users: User[]; lastUpdated: string; timestamp: string } {
    // 현재 요청의 타임스탬프와 식별자 (로깅용)
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    this.lastRequestId = `req-${Math.floor(
      Math.random() * 10000
    )}-${timestamp}`;

    console.log(`[getAllUsers 호출] 요청 ID: ${this.lastRequestId}`);

    // 셔플된 사용자 목록 반환 (ISR 캐싱 테스트를 위해 동일한 데이터 유지)
    return {
      users: this.shuffledUsers,
      lastUpdated: this.lastUpdated,
      timestamp: timestamp, // 캐싱에 영향을 주지 않는 현재 요청 시간
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

    // 데이터 업데이트 시간 갱신 및 사용자 목록 재셔플
    this.updateAllUsersData();

    return newUser;
  }

  // 모든 사용자 데이터 수동 업데이트 (재검증 테스트용)
  updateAllUsers(): { users: User[]; lastUpdated: string; timestamp: string } {
    // 데이터 업데이트 및 재셔플
    this.updateAllUsersData();

    console.log(`[수동 업데이트] 데이터 갱신됨: ${this.lastUpdated}`);

    // 최신 데이터 반환
    return this.getAllUsers();
  }

  // 사용자 목록을 한 번만 셔플 (고정된 순서 생성)
  private shuffleUsersOnce(): void {
    this.shuffledUsers = this.shuffleArray([...this.users]);
    console.log('[데이터 셔플] 사용자 목록 순서가 변경되었습니다.');
  }

  // 모든 데이터 업데이트 (시간 갱신 + 재셔플)
  private updateAllUsersData(): void {
    // 현재 시간 설정
    const now = new Date();
    this.lastUpdated = now.toISOString();
    const timestamp = now.toLocaleTimeString();

    // 사용자 목록 재셔플
    this.shuffleUsersOnce();

    console.log(
      `[데이터 갱신] ${timestamp} - 타임스탬프 업데이트 및 사용자 목록 재셔플`
    );
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
