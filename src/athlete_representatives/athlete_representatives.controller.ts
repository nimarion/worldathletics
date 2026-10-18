import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AthleteRepresentativesService } from './athlete_representatives.service';
import {
  AthleteRepresentative,
  RepresentedAthlete,
} from './athlete_representative.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('ar')
export class AthleteRepresentativesController {
  constructor(
    private readonly athleteRepresentativesService: AthleteRepresentativesService,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'Returns the list of athlete representatives',
    type: AthleteRepresentative,
    isArray: true,
  })
  findAll(): Promise<AthleteRepresentative[]> {
    return this.athleteRepresentativesService.getAthleteRepresentatives();
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Returns the athlete representative profile',
    type: AthleteRepresentative,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AthleteRepresentative> {
    const ar =
      await this.athleteRepresentativesService.getAthleteRepresentative(id);
    if (!ar) {
      throw new NotFoundException();
    }
    return ar;
  }

  @Get(':id/athletes')
  @ApiOkResponse({
    description:
      'Returns the list of athletes represented by the representative',
    type: RepresentedAthlete,
    isArray: true,
  })
  async findAthletes(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RepresentedAthlete[]> {
    const athletes =
      await this.athleteRepresentativesService.getRepresentedAthletes(id);
    if (!athletes) {
      throw new NotFoundException(
        `Representative with ID ${id} or their athletes list not found`,
      );
    }
    return athletes;
  }
}
