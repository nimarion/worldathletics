import { ApiProperty } from '@nestjs/swagger';

export class AthleteRepresentative {
  @ApiProperty()
  id!: number;
  @ApiProperty({ nullable: true, type: String })
  country!: string | null;
  @ApiProperty()
  firstname!: string;
  @ApiProperty()
  lastname!: string;
  @ApiProperty({ nullable: true, type: String })
  email!: string | null;
  @ApiProperty({ nullable: true, type: String })
  phone!: string | null;
}

export class RepresentedAthlete {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  firstname!: string;
  @ApiProperty()
  lastname!: string;
  @ApiProperty()
  country!: string;
  @ApiProperty({ nullable: true, type: Date })
  birthdate!: Date | null;
  @ApiProperty()
  birthdateOnlyYear!: boolean;
  @ApiProperty()
  sex!: string;
}

