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
import { PostsService } from './posts.service';
import { CreatePostDto, PostDto, UpdatePostDto } from './posts.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(@Query('_limit') limit?: string): Promise<PostDto[]> {
    return this.postsService.findAll(limit ? parseInt(limit) : undefined);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostDto> {
    return this.postsService.findOne(parseInt(id));
  }

  @Post()
  async create(@Body() createPostDto: CreatePostDto): Promise<PostDto> {
    return this.postsService.create(createPostDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto
  ): Promise<PostDto> {
    return this.postsService.update(parseInt(id), updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.postsService.remove(parseInt(id));
  }
}
