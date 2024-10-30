import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { Country } from './country.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @ApiOkResponse({
    type: Country,
    isArray: true,
    description: 'Returns all countries',
  })
  async getCountries(): Promise<Country[]> {
    return await this.countriesService.getCountries();
  }
}
