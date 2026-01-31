import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CommunitiesService } from './communities.service';

@Controller('api/v1/communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Get()
  async findAll() {
    return this.communitiesService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.communitiesService.findBySlug(slug);
  }

  @Post()
  async create(@Body() data: any) {
    return this.communitiesService.create(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.communitiesService.delete(parseInt(id));
    return { message: 'Community deleted successfully' };
  }
}
