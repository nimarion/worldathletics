import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
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
  findOne(@Param('id') id: string): Promise<AthleteRepresentative> {
    return this.athleteRepresentativesService
      .getAthleteRepresentative(+id)
      .then((ar) => {
        if (!ar) {
          throw new NotFoundException();
        }
        return ar;
      });
  }

  @Get(':id/athletes')
  @ApiOkResponse({
    description:
      'Returns the list of athletes represented by the representative',
    type: RepresentedAthlete,
    isArray: true,
  })
  findAthletes(@Param('id') id: string): Promise<RepresentedAthlete[]> {
    return this.athleteRepresentativesService
      .getRepresentedAthletes(+id)
      .then((athletes) => {
        if (!athletes) {
          throw new NotFoundException(
            `Representative with ID ${id} or their athletes list not found`,
          );
        }
        return athletes;
      });
  }
}
