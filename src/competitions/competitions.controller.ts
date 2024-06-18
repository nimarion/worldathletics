import { Controller, Get, Param } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';

@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get()
  findAll() {
    return null;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(id);
    return null;
  }

  @Get(':id/organiser')
  findOrganiser(@Param('id') id: string) {
    console.log(id);
    return null;
  }
}
