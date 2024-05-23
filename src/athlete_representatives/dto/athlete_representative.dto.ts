import { ApiProperty } from '@nestjs/swagger';

export class AthleteRepresentative {
  @ApiProperty()
  id: number;
  @ApiProperty()
  country: string;
  @ApiProperty()
  firstname: string;
  @ApiProperty()
  lastname: string;
  @ApiProperty()
  email: string | null;
  @ApiProperty()
  phone: string | null;
}
