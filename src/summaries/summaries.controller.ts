import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SummariesService } from './summaries.service';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from 'src/users/users.entity';

@Controller('summaries')
@UseGuards(JwtAuthGuard)
export class SummariesController {
  constructor(private summariesService: SummariesService) {}

  @Post()
  async create(
    @Body() createSummaryDto: CreateSummaryDto,
    @Request() req: Partial<User>,
  ) {
    return this.summariesService.create(req.id!, createSummaryDto);
  }

  @Get()
  async findAll(@Request() req: Partial<User>) {
    return this.summariesService.findAllByUserId(req.id!);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: Partial<User>,
  ) {
    return this.summariesService.findOne(id, req.id!);
  }
}
