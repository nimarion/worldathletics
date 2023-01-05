import { ApiProperty } from '@nestjs/swagger';

export class PerformanceDto {
  @ApiProperty()
  date: Date;
  @ApiProperty()
  discipline: string;
  @ApiProperty()
  disciplineCode: string;
  @ApiProperty()
  mark: string;
  @ApiProperty()
  venue: string;
  @ApiProperty()
  indoor: boolean;
  @ApiProperty()
  notLegal: boolean;
}

export class AthleteDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  firstname: string;
  @ApiProperty()
  lastname: string;
  @ApiProperty()
  birthdate: Date;
  @ApiProperty()
  country: string;
  @ApiProperty()
  sex: 'MALE' | 'FEMALE' | null;
  @ApiProperty({ type: PerformanceDto })
  personalbests: PerformanceDto[];
  @ApiProperty({ type: PerformanceDto })
  seasonsbests: PerformanceDto[];
}
