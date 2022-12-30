import { Controller, BadGatewayException, Get } from '@nestjs/common';
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
    const countries = await this.countriesService.getCountries();
    if (countries) {
      return countries;
    }
    throw new BadGatewayException();
  }
}
