import { ApiProperty } from '@nestjs/swagger';

export class Country {
  @ApiProperty()
  areaCode: string;
  @ApiProperty()
  areaName: string;
  @ApiProperty()
  id: string;
  @ApiProperty()
  countryName: string;
}
