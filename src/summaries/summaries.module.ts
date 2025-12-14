import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummariesService } from './summaries.service';
import { SummariesController } from './summaries.controller';
import { Summary } from './summaries.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Summary]), AiModule],
  controllers: [SummariesController],
  providers: [SummariesService],
})
export class SummariesModule {}
