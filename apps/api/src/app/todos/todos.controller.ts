import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto, TodoDto, UpdateTodoDto } from './todos.dto';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  async findAll(@Query('_limit') limit?: string): Promise<TodoDto[]> {
    return this.todosService.findAll(limit ? parseInt(limit) : undefined);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TodoDto> {
    return this.todosService.findOne(parseInt(id));
  }

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto): Promise<TodoDto> {
    return this.todosService.create(createTodoDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto
  ): Promise<TodoDto> {
    return this.todosService.update(parseInt(id), updateTodoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.todosService.remove(parseInt(id));
  }
}
