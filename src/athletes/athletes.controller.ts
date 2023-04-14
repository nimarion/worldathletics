import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { AthletesService } from './athletes.service';
import { ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { Athlete, Performance } from './athlete.dto';
import { ResultsService } from './results/result.service';

@Controller('athletes')
export class AthletesController {
  constructor(
    private readonly athletesService: AthletesService,
    private readonly resultsService: ResultsService,
  ) {}

  @Get(':id')
  @ApiOkResponse({
    description: 'Returns the athlete profile',
    type: Athlete,
  })
  @ApiNotFoundResponse({ description: 'Athlete not found' })
  async getAthleteById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Athlete> {
    if (id < 1 || id > 2147483647) {
      throw new NotFoundException();
    }
    const athlete = await this.athletesService.getAthlete(id);
    if (!athlete) {
      throw new NotFoundException();
    }
    return athlete;
  }

  @Get(':id/results')
  async getResultsbyAthleteId(
    @Param('id', ParseIntPipe) id: number,
    @Query('year') year?: number,
  ): Promise<Performance[]> {
    console.log(year);
    const results = await this.resultsService.getResultsFromAthlete(id, year);
    if (!results) {
      throw new NotFoundException();
    }
    return results;
  }
}
