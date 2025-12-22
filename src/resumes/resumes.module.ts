import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { LlamaExtractService } from './llama-extract.service';
import { Resume } from './resumes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resume])],
  controllers: [ResumesController],
  providers: [ResumesService, LlamaExtractService],
  exports: [ResumesService],
})
export class ResumesModule {}
