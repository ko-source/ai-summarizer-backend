import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './resumes.entity';
import { LlamaExtractService } from './llama-extract.service';
import type { File as MulterFile } from 'multer';

@Injectable()
export class ResumesService {
  constructor(
    @InjectRepository(Resume)
    private resumesRepository: Repository<Resume>,
    private llamaExtractService: LlamaExtractService,
  ) {}

  async extractResume(
    userId: number,
    file: MulterFile,
  ): Promise<Resume> {
    try {
      const agentId = await this.llamaExtractService.getOrCreateAgent();
      const fileId = await this.llamaExtractService.uploadFile(file);
      const existingResume = await this.resumesRepository.findOne({
        where: { fileId, userId },
      });

      if (existingResume) {
        return existingResume;
      }

      const jobId = await this.llamaExtractService.runExtractionJob(
        agentId,
        fileId,
      );

      await this.llamaExtractService.pollJobStatus(jobId);
      const result = await this.llamaExtractService.getExtractionResults(jobId);
      const resumeDuringExtraction = await this.resumesRepository.findOne({
        where: { fileId, userId },
      });

      if (resumeDuringExtraction) {
        return resumeDuringExtraction;
      }

      const extractedData = result.data;

      const resume = this.resumesRepository.create({
        userId,
        fileName: file.originalname,
        fileId,
        experience: extractedData.experience || [],
        education: extractedData.education || [],
        techStack: extractedData.techStack || [],
        rawData: result.data,
      });

      return this.resumesRepository.save(resume);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error during resume extraction';
      throw new InternalServerErrorException(`Failed to extract resume: ${message}`);
    }
  }

  async findAllByUserId(userId: number): Promise<Resume[]> {
    return this.resumesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Resume> {
    const resume = await this.resumesRepository.findOne({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume;
  }
}
