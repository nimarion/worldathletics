import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AthletesService } from './athletes.service';
import { ApiOkResponse, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';
import { Athlete, AthleteSearchResult, Performance } from './athlete.dto';
import { ResultsService } from './results/result.service';

@Controller('athletes')
export class AthletesController {
  constructor(
    private readonly athletesService: AthletesService,
    private readonly resultsService: ResultsService,
  ) {}

  @Get('/search')
  @ApiOkResponse({
    type: AthleteSearchResult,
  })
  async searchAthlete(
    @Query('name') name: string,
  ): Promise<AthleteSearchResult[]> {
    if (!name) {
      throw new BadRequestException('Query parameter "name" is required');
    }
    return await this.athletesService.searchAthlete(name);
  }

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
      throw new BadRequestException('Invalid value for athlete id');
    }
    return this.athletesService.getAthlete(id).then((athlete) => {
      if (!athlete) {
        throw new NotFoundException();
      }
      return athlete;
    });
  }

  @Get(':id/results')
  @ApiQuery({
    name: 'year',
    type: Number,
    required: false,
  })
  @ApiOkResponse({
    description: 'Returns the athlete results',
    type: Performance,
    isArray: true,
  })
  async getResultsbyAthleteId(
    @Param('id', ParseIntPipe) id: number,
    @Query('year') year?: number,
  ): Promise<Performance[]> {
    if (!year) {
      const athlete = await this.athletesService.getAthlete(id);
      if (!athlete) {
        throw new NotFoundException();
      }
      const allResults = [];
      const promises = athlete.activeSeasons.map(async (season) => {
        try {
          const results = await this.resultsService.getResultsFromAthlete(
            id,
            season,
          );
          if (results) {
            allResults.push(results);
          }
        } catch (error) {
          console.error(`Error fetching results for season ${season}:`, error);
        }
      });
      await Promise.all(promises);
      return allResults.flat();
    }
    const results = await this.resultsService.getResultsFromAthlete(id, year);
    if (!results) {
      return [];
    }
    return results;
  }
}
