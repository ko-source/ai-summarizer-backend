import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Summary } from './summaries.entity';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class SummariesService {
  constructor(
    @InjectRepository(Summary)
    private summariesRepository: Repository<Summary>,
    private aiService: AiService,
  ) {}

  async create(
    userId: number,
    createSummaryDto: CreateSummaryDto,
  ): Promise<Summary> {
    const { text } = createSummaryDto;

    const aiResult = await this.aiService.summarize(text);

    const summary = this.summariesRepository.create({
      userId,
      originalText: text,
      summary: aiResult.summary,
      actionItems: aiResult.actionItems,
      risks: aiResult.risks,
      nextSteps: aiResult.nextSteps,
    });

    return this.summariesRepository.save(summary);
  }

  async findAllByUserId(userId: number): Promise<Summary[]> {
    return this.summariesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Summary> {
    const summary = await this.summariesRepository.findOne({
      where: { id, userId },
    });

    if (!summary) {
      throw new NotFoundException('Summary not found');
    }

    return summary;
  }
}
