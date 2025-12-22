import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumesService } from './resumes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from 'src/users/users.entity';
import type { Request as ExpressRequest } from 'express';
import type { File as MulterFile } from 'multer';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private resumesService: ResumesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile() file: MulterFile,
    @Request() req: ExpressRequest & { user: User },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Supported formats: PDF, Word, Text, or Images (JPG, PNG, GIF, WEBP).',
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    return this.resumesService.extractResume(req.user.id, file);
  }

  @Get()
  async findAll(@Request() req: ExpressRequest & { user: User }) {
    return this.resumesService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: User },
  ) {
    return this.resumesService.findOne(id, req.user.id);
  }
}
