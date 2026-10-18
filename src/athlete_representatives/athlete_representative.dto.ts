import { ApiProperty, OmitType } from '@nestjs/swagger';
import { BaseAthlete, Sex } from 'src/athletes/athlete.dto';

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

export class RepresentedAthlete extends OmitType(BaseAthlete, [
  'sex',
] as const) {
  @ApiProperty({
    enum: ['M', 'W', 'X'],
  })
  sex!: Sex;
}
