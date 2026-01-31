import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: ['author', 'community'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author', 'community'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async findByAuthor(authorId: string): Promise<Post[]> {
    return this.postsRepository.find({
      where: { authorId },
      relations: ['author', 'community'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCommunity(communityId: number): Promise<Post[]> {
    return this.postsRepository.find({
      where: { communityId },
      relations: ['author', 'community'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(createPostDto: CreatePostDto, authorId: string): Promise<Post> {
    const post = this.postsRepository.create({
      ...createPostDto,
      authorId,
    });
    return this.postsRepository.save(post);
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    Object.assign(post, updatePostDto);
    return this.postsRepository.save(post);
  }

  async delete(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postsRepository.remove(post);
  }

  async like(id: number): Promise<Post> {
    const post = await this.findOne(id);
    post.likesCount += 1;
    return this.postsRepository.save(post);
  }
}
