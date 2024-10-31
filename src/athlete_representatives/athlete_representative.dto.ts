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
