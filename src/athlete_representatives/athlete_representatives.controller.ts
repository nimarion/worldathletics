import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { AthleteRepresentativesService } from './athlete_representatives.service';
import { AthleteRepresentative } from './athlete_representative.dto';
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
}
