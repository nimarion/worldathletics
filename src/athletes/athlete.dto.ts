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
  legal: boolean;
  @ApiProperty()
  resultScore: number;
  @ApiProperty({ nullable: true, type: Number })
  wind: number | null;
  @ApiProperty({ nullable: true, type: String })
  competition: string | null;
  @ApiProperty({ nullable: true, type: Date })
  country: string | null;
  @ApiProperty({ nullable: true, type: String })
  category: string | null;
  @ApiProperty({ nullable: true, type: String })
  race: string | null;
  @ApiProperty({ nullable: true, type: Number })
  place: number | null;
}

export class CurrentWorldRanking {
  @ApiProperty()
  place: number;
  @ApiProperty()
  eventGroup: string;
}

export class HonourResult {
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
  @ApiProperty({ type: HonourResult, isArray: true })
  results: HonourResult[];
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
  @ApiProperty({ type: Number, isArray: true })
  activeSeasons: number[];
}
