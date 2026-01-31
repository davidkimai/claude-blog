import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community)
    private communitiesRepository: Repository<Community>,
  ) {}

  async findAll(): Promise<Community[]> {
    return this.communitiesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Community> {
    const community = await this.communitiesRepository.findOne({ where: { id } });
    if (!community) {
      throw new NotFoundException(`Community with ID ${id} not found`);
    }
    return community;
  }

  async findBySlug(slug: string): Promise<Community> {
    const community = await this.communitiesRepository.findOne({ where: { slug } });
    if (!community) {
      throw new NotFoundException(`Community with slug ${slug} not found`);
    }
    return community;
  }

  async create(data: Partial<Community>): Promise<Community> {
    const community = this.communitiesRepository.create(data);
    return this.communitiesRepository.save(community);
  }

  async update(id: number, data: Partial<Community>): Promise<Community> {
    const community = await this.findOne(id);
    Object.assign(community, data);
    return this.communitiesRepository.save(community);
  }

  async delete(id: number): Promise<void> {
    const community = await this.findOne(id);
    await this.communitiesRepository.remove(community);
  }
}
