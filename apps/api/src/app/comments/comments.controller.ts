import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from './comments.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(@Query('_limit') limit?: number): CommentDto[] {
    return this.commentsService.findAll(limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string): CommentDto {
    try {
      return this.commentsService.findOne(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('댓글을 찾을 수 없습니다', HttpStatus.NOT_FOUND);
    }
  }
}
