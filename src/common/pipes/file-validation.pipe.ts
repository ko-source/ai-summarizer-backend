import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import type { File as MulterFile } from 'multer';
import {
  ALLOWED_RESUME_MIME_TYPES,
  RESUME_MAX_FILE_SIZE_BYTES,
} from '../constants/file-upload.constants';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: MulterFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!ALLOWED_RESUME_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Supported formats: PDF, Word, Text, or Images (JPG, PNG, GIF, WEBP).',
      );
    }

    if (file.size > RESUME_MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    return file;
  }
}
