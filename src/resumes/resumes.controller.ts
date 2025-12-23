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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumesService } from './resumes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../users/users.entity';
import type { Request as ExpressRequest } from 'express';
import type { File as MulterFile } from 'multer';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private resumesService: ResumesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile(FileValidationPipe) file: MulterFile,
    @Request() req: ExpressRequest & { user: User },
  ) {
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
