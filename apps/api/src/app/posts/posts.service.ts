import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto, PostDto, UpdatePostDto } from './posts.dto';

@Injectable()
export class PostsService {
  private readonly basePosts = [
    {
      id: 1,
      title: '첫 번째 게시물',
      body: '이것은 첫 번째 게시물의 내용입니다.',
      userId: 1,
    },
    {
      id: 2,
      title: '두 번째 게시물',
      body: '이것은 두 번째 게시물의 내용입니다.',
      userId: 1,
    },
    {
      id: 3,
      title: '세 번째 게시물',
      body: '이것은 세 번째 게시물의 내용입니다.',
      userId: 2,
    },
    {
      id: 4,
      title: '네 번째 게시물',
      body: '이것은 네 번째 게시물의 내용입니다.',
      userId: 2,
    },
    {
      id: 5,
      title: '다섯 번째 게시물',
      body: '이것은 다섯 번째 게시물의 내용입니다.',
      userId: 3,
    },
  ];

  // 모든 포스트 조회 (선택적 limit)
  async findAll(limit?: number): Promise<PostDto[]> {
    // 현재 시간 기반 타임스탬프 생성
    const timestamp = new Date().toLocaleTimeString('ko-KR');

    // 동적으로 데이터 생성 (매번 약간씩 다른 데이터 반환)
    const posts = this.basePosts.map((post) => ({
      ...post,
      // 제목에 타임스탬프 추가하여 변경점 확인 가능
      title: `${post.title} (${timestamp})`,
      // 랜덤 조회수 추가
      views: Math.floor(Math.random() * 1000),
      // 랜덤 좋아요 수 추가
      likes: Math.floor(Math.random() * 50),
    }));

    if (limit) {
      return posts.slice(0, limit);
    }
    return posts;
  }

  // 단일 포스트 조회
  async findOne(id: number): Promise<PostDto | undefined> {
    const basePost = this.basePosts.find((post) => post.id === id);
    if (!basePost) return undefined;

    // 현재 시간 기반 타임스탬프 생성
    const timestamp = new Date().toLocaleTimeString('ko-KR');

    return {
      ...basePost,
      title: `${basePost.title} (${timestamp})`,
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 50),
    };
  }

  // 새 포스트 생성
  async create(createPostDto: CreatePostDto): Promise<PostDto> {
    const newPost: PostDto = {
      id: this.getNextId(),
      ...createPostDto,
    };
    this.basePosts.push(newPost);
    return newPost;
  }

  // 포스트 업데이트
  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostDto> {
    const postIndex = this.basePosts.findIndex((post) => post.id === id);
    if (postIndex === -1) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const updatedPost = {
      ...this.basePosts[postIndex],
      ...updatePostDto,
    };
    this.basePosts[postIndex] = updatedPost;
    return updatedPost;
  }

  // 포스트 삭제
  async remove(id: number): Promise<void> {
    const postIndex = this.basePosts.findIndex((post) => post.id === id);
    if (postIndex === -1) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    this.basePosts.splice(postIndex, 1);
  }

  // 다음 ID 값 계산
  private getNextId(): number {
    return this.basePosts.length > 0
      ? Math.max(...this.basePosts.map((post) => post.id)) + 1
      : 1;
  }
}
