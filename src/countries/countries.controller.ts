import { Controller, BadGatewayException, Get } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  async getCountries() {
    const countries = await this.countriesService.getCountries();
    if (countries) {
      return countries;
    }
    throw new BadGatewayException();
  }
}
