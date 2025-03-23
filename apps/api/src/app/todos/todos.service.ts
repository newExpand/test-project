import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto, TodoDto, UpdateTodoDto } from './todos.dto';

@Injectable()
export class TodosService {
  // 더미 데이터로 시작
  private todos: TodoDto[] = [
    {
      id: 1,
      title: '프로젝트 계획 수립',
      completed: true,
      userId: 1,
    },
    {
      id: 2,
      title: '기본 구조 설계',
      completed: true,
      userId: 1,
    },
    {
      id: 3,
      title: '백엔드 API 구현',
      completed: false,
      userId: 1,
    },
    {
      id: 4,
      title: '프론트엔드 개발',
      completed: false,
      userId: 1,
    },
    {
      id: 5,
      title: '테스트 및 배포',
      completed: false,
      userId: 2,
    },
  ];

  // 모든 할일 조회 (선택적 limit)
  async findAll(limit?: number): Promise<TodoDto[]> {
    if (limit) {
      return this.todos.slice(0, limit);
    }
    return this.todos;
  }

  // 단일 할일 조회
  async findOne(id: number): Promise<TodoDto> {
    const todo = this.todos.find((todo) => todo.id === id);
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  // 새 할일 생성
  async create(createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const newTodo: TodoDto = {
      id: this.getNextId(),
      ...createTodoDto,
    };
    this.todos.push(newTodo);
    return newTodo;
  }

  // 할일 업데이트
  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<TodoDto> {
    const todoIndex = this.todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    const updatedTodo = {
      ...this.todos[todoIndex],
      ...updateTodoDto,
    };
    this.todos[todoIndex] = updatedTodo;
    return updatedTodo;
  }

  // 할일 삭제
  async remove(id: number): Promise<void> {
    const todoIndex = this.todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    this.todos.splice(todoIndex, 1);
  }

  // 다음 ID 값 계산
  private getNextId(): number {
    return this.todos.length > 0
      ? Math.max(...this.todos.map((todo) => todo.id)) + 1
      : 1;
  }
}
