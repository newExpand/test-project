// 게시물 기본 데이터 구조
export class PostDto {
  id!: number;
  title!: string;
  body!: string;
  userId!: number;
  views?: number;
  likes?: number;
}

// 게시물 생성 시 필요한 데이터
export class CreatePostDto {
  title!: string;
  body!: string;
  userId!: number;
}

// 게시물 업데이트 시 필요한 데이터
export class UpdatePostDto {
  title?: string;
  body?: string;
  userId?: number;
  views?: number;
  likes?: number;
}
