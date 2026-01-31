import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Controller('api/v1/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(@Query('communityId') communityId?: string) {
    if (communityId) {
      return this.postsService.findByCommunity(parseInt(communityId));
    }
    return this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(parseInt(id));
  }

  @Get('author/:authorId')
  async findByAuthor(@Param('authorId') authorId: string) {
    return this.postsService.findByAuthor(authorId);
  }

  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Request() req) {
    // TODO: Add auth back when AuthModule is created
    const authorId = req.user?.id || 'demo_user';
    return this.postsService.create(createPostDto, authorId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(parseInt(id), updatePostDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.postsService.delete(parseInt(id));
    return { message: 'Post deleted successfully' };
  }

  @Post(':id/like')
  async like(@Param('id') id: string) {
    return this.postsService.like(parseInt(id));
  }
}
