import { ApiProperty } from '@nestjs/swagger';

export class Location {
  @ApiProperty()
  country: string;
  @ApiProperty({ nullable: true, type: String })
  stadium?: string;
  @ApiProperty()
  city: string;
}
