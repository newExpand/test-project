import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from './comments.dto';

@Injectable()
export class CommentsService {
  private readonly baseComments = [
    {
      id: 1,
      postId: 1,
      name: '홍길동',
      email: 'hong@example.com',
      body: '첫 번째 댓글입니다.',
    },
    {
      id: 2,
      postId: 1,
      name: '김철수',
      email: 'kim@example.com',
      body: '두 번째 댓글입니다.',
    },
    {
      id: 3,
      postId: 2,
      name: '이영희',
      email: 'lee@example.com',
      body: '세 번째 댓글입니다.',
    },
    {
      id: 4,
      postId: 2,
      name: '박민수',
      email: 'park@example.com',
      body: '네 번째 댓글입니다.',
    },
    {
      id: 5,
      postId: 3,
      name: '정지훈',
      email: 'jung@example.com',
      body: '다섯 번째 댓글입니다.',
    },
  ];

  async findAll(limit?: number): Promise<CommentDto[]> {
    // 현재 시간 기반 타임스탬프 생성
    const timestamp = new Date().toLocaleTimeString('ko-KR');

    // 동적으로 데이터 생성 (매번 약간씩 다른 데이터 반환)
    const comments = this.baseComments.map((comment) => ({
      ...comment,
      // 이름에 타임스탬프 추가하여 변경점 확인 가능
      name: `${comment.name} (${timestamp})`,
      // 랜덤 평점 추가
      rating: Math.floor(Math.random() * 5) + 1,
      // 댓글 작성 시간 추가
      createdAt: new Date().toISOString(),
    }));

    if (limit) {
      return comments.slice(0, limit);
    }
    return comments;
  }

  async findOne(id: number): Promise<CommentDto | undefined> {
    const baseComment = this.baseComments.find((comment) => comment.id === id);
    if (!baseComment) return undefined;

    // 현재 시간 기반 타임스탬프 생성
    const timestamp = new Date().toLocaleTimeString('ko-KR');

    return {
      ...baseComment,
      name: `${baseComment.name} (${timestamp})`,
      rating: Math.floor(Math.random() * 5) + 1,
      createdAt: new Date().toISOString(),
    };
  }

  async findByPostId(postId: number): Promise<CommentDto[]> {
    // 현재 시간 기반 타임스탬프 생성
    const timestamp = new Date().toLocaleTimeString('ko-KR');

    // 특정 게시물의 댓글을 찾은 다음 동적 데이터 추가
    const filteredComments = this.baseComments
      .filter((comment) => comment.postId === postId)
      .map((comment) => ({
        ...comment,
        name: `${comment.name} (${timestamp})`,
        rating: Math.floor(Math.random() * 5) + 1,
        createdAt: new Date().toISOString(),
      }));

    return filteredComments;
  }

  // 나머지 메서드는 그대로 유지
  async create(createCommentDto: CreateCommentDto): Promise<CommentDto> {
    const newComment = {
      id: this.getNextId(),
      ...createCommentDto,
    };
    this.baseComments.push(newComment);
    return newComment;
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto
  ): Promise<CommentDto> {
    const commentIndex = this.baseComments.findIndex(
      (comment) => comment.id === id
    );
    if (commentIndex === -1) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    const updatedComment = {
      ...this.baseComments[commentIndex],
      ...updateCommentDto,
    };
    this.baseComments[commentIndex] = updatedComment;
    return updatedComment;
  }

  async remove(id: number): Promise<void> {
    const commentIndex = this.baseComments.findIndex(
      (comment) => comment.id === id
    );
    if (commentIndex === -1) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    this.baseComments.splice(commentIndex, 1);
  }

  private getNextId(): number {
    return this.baseComments.length > 0
      ? Math.max(...this.baseComments.map((comment) => comment.id)) + 1
      : 1;
  }
}
