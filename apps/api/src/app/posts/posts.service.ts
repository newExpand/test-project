import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto, PostDto, UpdatePostDto } from './posts.dto';

@Injectable()
export class PostsService {
  // 더미 데이터로 시작
  private posts: PostDto[] = [
    {
      id: 1,
      title: '첫 번째 포스트',
      body: '이것은 첫 번째 포스트의 내용입니다.',
      userId: 1,
    },
    {
      id: 2,
      title: '두 번째 포스트',
      body: '이것은 두 번째 포스트의 내용입니다.',
      userId: 1,
    },
    {
      id: 3,
      title: '세 번째 포스트',
      body: '이것은 세 번째 포스트의 내용입니다.',
      userId: 2,
    },
  ];

  // 모든 포스트 조회 (선택적 limit)
  async findAll(limit?: number): Promise<PostDto[]> {
    if (limit) {
      return this.posts.slice(0, limit);
    }
    return this.posts;
  }

  // 단일 포스트 조회
  async findOne(id: number): Promise<PostDto> {
    const post = this.posts.find((post) => post.id === id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  // 새 포스트 생성
  async create(createPostDto: CreatePostDto): Promise<PostDto> {
    const newPost: PostDto = {
      id: this.getNextId(),
      ...createPostDto,
    };
    this.posts.push(newPost);
    return newPost;
  }

  // 포스트 업데이트
  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostDto> {
    const postIndex = this.posts.findIndex((post) => post.id === id);
    if (postIndex === -1) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const updatedPost = {
      ...this.posts[postIndex],
      ...updatePostDto,
    };
    this.posts[postIndex] = updatedPost;
    return updatedPost;
  }

  // 포스트 삭제
  async remove(id: number): Promise<void> {
    const postIndex = this.posts.findIndex((post) => post.id === id);
    if (postIndex === -1) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    this.posts.splice(postIndex, 1);
  }

  // 다음 ID 값 계산
  private getNextId(): number {
    return this.posts.length > 0
      ? Math.max(...this.posts.map((post) => post.id)) + 1
      : 1;
  }
}
