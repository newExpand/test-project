// 할일 기본 데이터 구조
export class TodoDto {
  id!: number;
  title!: string;
  completed!: boolean;
  userId!: number;
}

// 할일 생성 시 필요한 데이터
export class CreateTodoDto {
  title!: string;
  completed!: boolean;
  userId!: number;
}

// 할일 업데이트 시 필요한 데이터
export class UpdateTodoDto {
  title?: string;
  completed?: boolean;
  userId?: number;
}
