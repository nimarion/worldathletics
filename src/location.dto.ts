import { ApiProperty } from '@nestjs/swagger';

export class Location {
  @ApiProperty()
  country!: string;
  @ApiProperty({ nullable: true, type: String })
  stadium?: string;
  @ApiProperty({ nullable: true, type: String })
  city?: string;
  @ApiProperty()
  indoor!: boolean;
}
