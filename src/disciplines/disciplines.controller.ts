import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Discipline } from './discipline.entity';
import { DisciplinesService } from './disciplines.service';

@Controller('disciplines')
export class DisciplinesController {
  constructor(private readonly disciplinesService: DisciplinesService) {}

  @Get()
  @ApiOkResponse({
    type: Discipline,
    isArray: true,
    description: 'Returns all disciplines',
  })
  findAll(): Promise<Discipline[]> {
    return this.disciplinesService.findAll();
  }
}
