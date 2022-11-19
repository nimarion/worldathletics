import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { AthletesService } from './athletes.service';

@Controller('athletes')
export class AthletesController {
  constructor(private readonly athletesService: AthletesService) {}

  @Get(':id')
  async getAthleteById(@Param('id', ParseIntPipe) id: number) {
    const athlete = await this.athletesService.getAthlete(id);
    if (!athlete) {
      throw new NotFoundException();
    }
    return athlete;
  }
}
