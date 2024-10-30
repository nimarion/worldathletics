import { ApiProperty } from '@nestjs/swagger';

export class AthleteRepresentative {
  @ApiProperty()
  id!: number;
  @ApiProperty({ nullable: true })
  country!: string | null;
  @ApiProperty()
  firstname!: string;
  @ApiProperty()
  lastname!: string;
  @ApiProperty({ nullable: true })
  email!: string | null;
  @ApiProperty({ nullable: true })
  phone!: string | null;
}
