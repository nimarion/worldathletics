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

export class CurrentWorldRanking {
  @ApiProperty()
  place: number;
  @ApiProperty()
  eventGroup: string;
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
  @ApiProperty({ nullable: true, enum: ['MALE', 'FEMALE'] })
  sex: 'MALE' | 'FEMALE' | null;
  @ApiProperty({ type: PerformanceDto, isArray: true })
  personalbests: PerformanceDto[];
  @ApiProperty({ type: PerformanceDto, isArray: true })
  seasonsbests: PerformanceDto[];
  @ApiProperty({ type: CurrentWorldRanking, isArray: true })
  currentWorldRankings: CurrentWorldRanking[];
}
