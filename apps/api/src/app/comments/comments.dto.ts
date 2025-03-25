export class CommentDto {
  id!: number;
  postId!: number;
  name!: string;
  email!: string;
  body!: string;
  rating?: number;
  createdAt?: string;
}

export class CreateCommentDto {
  postId!: number;
  name!: string;
  email!: string;
  body!: string;
}

export class UpdateCommentDto {
  postId?: number;
  name?: string;
  email?: string;
  body?: string;
  rating?: number;
}
