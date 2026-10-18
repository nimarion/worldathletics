import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AthletesService } from './athletes.service';
import { ApiOkResponse, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';
import { Athlete, AthleteSearchResult, Performance } from './athlete.dto';
import { ResultsService } from './results/result.service';

@Controller('athletes')
export class AthletesController {
  private readonly logger = new Logger(AthletesController.name);

  constructor(
    private readonly athletesService: AthletesService,
    private readonly resultsService: ResultsService,
  ) {}

  @Get('/search')
  @ApiQuery({
    name: 'name',
    required: true,
    type: String,
  })
  @ApiOkResponse({
    type: AthleteSearchResult,
    isArray: true,
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
    const athlete = await this.athletesService.getAthlete(id);
    if (!athlete) {
      throw new NotFoundException();
    }
    return athlete;
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
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ): Promise<Performance[]> {
    if (!year) {
      const athlete = await this.athletesService.getAthlete(id);
      if (!athlete) {
        throw new NotFoundException();
      }
      const seasonResults = await Promise.all(
        athlete.activeSeasons.map(async (season) => {
          try {
            const results = await this.resultsService.getResultsFromAthlete(
              id,
              season,
            );
            return results ?? [];
          } catch (error) {
            this.logger.error(
              `Error fetching results for season ${season}:`,
              error,
            );
            return [];
          }
        }),
      );
      return seasonResults.flat();
    }
    const results = await this.resultsService.getResultsFromAthlete(id, year);
    if (!results) {
      return [];
    }
    return results;
  }
}
