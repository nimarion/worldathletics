import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { BaseDiscipline } from './discipline.dto';
import { DisciplinesService } from './disciplines.service';

@Controller('disciplines')
export class DisciplinesController {
  constructor(private readonly disciplinesService: DisciplinesService) {}

  @Get()
  @ApiOkResponse({
    type: BaseDiscipline,
    isArray: true,
    description: 'Returns all disciplines, all marked as non-technical!',
  })
  findAll(): Promise<BaseDiscipline[]> {
    return this.disciplinesService.findAll();
  }
}
