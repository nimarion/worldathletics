import { ApiProperty } from '@nestjs/swagger';

export class Performance {
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

export class Result {
  @ApiProperty()
  place: number;
  @ApiProperty()
  indoor: boolean;
  @ApiProperty()
  discipline: string;
  @ApiProperty()
  disciplineCode: string;
  @ApiProperty()
  mark: string;
  @ApiProperty()
  venue: string;
  @ApiProperty()
  date: Date;
  @ApiProperty()
  competition: string;
}

export class Honour {
  @ApiProperty({ type: Result, isArray: true })
  results: Result[];
  @ApiProperty()
  category: string;
}

export class Athlete {
  @ApiProperty()
  id: number;
  @ApiProperty()
  firstname: string;
  @ApiProperty()
  lastname: string;
  @ApiProperty({ nullable: true, type: Date })
  birthdate: Date | null;
  @ApiProperty()
  country: string;
  @ApiProperty({ nullable: true, enum: ['MALE', 'FEMALE'] })
  sex: 'MALE' | 'FEMALE' | null;
  @ApiProperty({ type: Performance, isArray: true })
  personalbests: Performance[];
  @ApiProperty({ type: Performance, isArray: true })
  seasonsbests: Performance[];
  @ApiProperty({ type: CurrentWorldRanking, isArray: true })
  currentWorldRankings: CurrentWorldRanking[];
  @ApiProperty({ type: Honour, isArray: true })
  honours: Honour[];
}
