import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { AthletesService } from './athletes.service';
import { ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { Athlete } from './athlete.dto';

@Controller('athletes')
export class AthletesController {
  constructor(private readonly athletesService: AthletesService) {}

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
}
