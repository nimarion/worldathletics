import { Controller, Get, Param } from '@nestjs/common';
import { AthleteRepresentativesService } from './athlete_representatives.service';
import { AthleteRepresentative } from './dto/athlete_representative.dto';

@Controller('ar')
export class AthleteRepresentativesController {
  constructor(
    private readonly athleteRepresentativesService: AthleteRepresentativesService,
  ) {}

  @Get()
  findAll(): Promise<AthleteRepresentative[]> {
    return this.athleteRepresentativesService.getAthleteRepresentatives();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AthleteRepresentative> {
    return this.athleteRepresentativesService.getAthleteRepresentative(+id);
  }
}
