import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Location } from './location.dto';
import { Discipline } from 'src/disciplines/discipline.entity';

export class BaseAthlete {
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
  @ApiProperty({
    description: 'null if sex could not be determined',
    nullable: true,
    enum: ['MALE', 'FEMALE'],
  })
  sex: 'MALE' | 'FEMALE' | null;
}

export class BasePerformance extends Discipline {
  @ApiProperty()
  date: Date;
  @ApiProperty()
  mark: string;
  @ApiProperty({
    description:
      'Performance in milliseconds for track events and centimeters for field events',
    nullable: true,
  })
  performanceValue: number | null;
  @ApiProperty()
  location: Location;
  @ApiProperty({ nullable: true, type: Number })
  wind: number | null;
}

export class Performance extends BasePerformance {
  @ApiProperty()
  legal: boolean;
  @ApiProperty()
  resultScore: number;
  @ApiProperty({ nullable: true, type: String })
  competition: string | null;
  @ApiProperty({ nullable: true, type: Number })
  competitionId: number | null;
  @ApiProperty({ nullable: true, type: Number })
  eventId: number | null;
  @ApiProperty({ nullable: true, type: String })
  category: string | null;
  @ApiProperty({ nullable: true, type: String })
  race: string | null;
  @ApiProperty({ nullable: true, type: Number })
  place: number | null;
  @ApiProperty({ type: String, isArray: true })
  records: string[];
}

export class CurrentWorldRanking {
  @ApiProperty()
  place: number;
  @ApiProperty()
  eventGroup: string;
}

export class HonourResult extends OmitType(BasePerformance, ['wind'] as const) {
  @ApiProperty()
  place: number;
  @ApiProperty()
  competition: string;
  @ApiProperty({ nullable: true, type: Number })
  competitionId: number | null;
  @ApiProperty({ nullable: true, type: Number })
  eventId: number | null;
}

export class Honour {
  @ApiProperty({ type: HonourResult, isArray: true })
  results: HonourResult[];
  @ApiProperty()
  category: string;
}

export class Athlete extends BaseAthlete {
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
  @ApiProperty({ nullable: true, type: Number })
  athleteRepresentativeId: number | null;
}

export class AthleteSearchResult extends BaseAthlete {
  @ApiProperty({
    type: Number,
    description: 'Levenshtein distance between search query and athlete name',
  })
  levenshteinDistance: number;
}
