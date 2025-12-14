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

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
  };
}

@Controller('summaries')
@UseGuards(JwtAuthGuard)
export class SummariesController {
  constructor(private summariesService: SummariesService) {}

  @Post()
  async create(
    @Body() createSummaryDto: CreateSummaryDto,
    @Request() req: RequestWithUser,
  ) {
    return this.summariesService.create(req.user.id, createSummaryDto);
  }

  @Get()
  async findAll(@Request() req: RequestWithUser) {
    return this.summariesService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.summariesService.findOne(id, req.user.id);
  }
}
