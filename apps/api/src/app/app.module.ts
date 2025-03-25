import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { TodosModule } from './todos/todos.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [AuthModule, UsersModule, PostsModule, TodosModule, CommentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
