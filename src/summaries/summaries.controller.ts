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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from 'src/users/users.entity';
import { Request as ExpressRequest } from 'express';
@Controller('summaries')
@UseGuards(JwtAuthGuard)
export class SummariesController {
  constructor(private summariesService: SummariesService) {}

  @Post()
  async create(
    @Body() createSummaryDto: CreateSummaryDto,
    @Request() req: ExpressRequest & { user: User },
  ) {
    return this.summariesService.create(req.user.id, createSummaryDto);
  }

  @Get()
  async findAll(@Request() req: ExpressRequest & { user: User }) {
    return this.summariesService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: User },
  ) {
    return this.summariesService.findOne(id, req.user.id);
  }
}
