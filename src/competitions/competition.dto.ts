import { ApiProperty } from '@nestjs/swagger';
import { Athlete, BasePerformance, Sex } from 'src/athletes/athlete.dto';
import { Discipline } from 'src/disciplines/discipline.dto';
import { Location } from 'src/location.dto';

export class ContactPerson {
  @ApiProperty()
  email!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({ nullable: true, type: String })
  phone!: string | null;
  @ApiProperty()
  role!: string;
}

export class CompetitionOrganiserInfo {
  @ApiProperty({ nullable: true, type: String })
  websiteUrl!: string | null;
  @ApiProperty({ nullable: true, type: String })
  liveStreamUrl!: string | null;
  @ApiProperty({ nullable: true, type: String })
  resultsUrl!: string | null;
  @ApiProperty({ type: [ContactPerson] })
  contactPersons!: ContactPerson[];
  @ApiProperty({
    type: [Map<string, string[]>],
  })
  events: any;
}

export class Competition {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  location!: Location;
  @ApiProperty()
  rankingCategory!: string;
  @ApiProperty()
  disciplines!: string[];
  @ApiProperty()
  start!: Date;
  @ApiProperty()
  end!: Date;
  @ApiProperty({ nullable: true, type: String })
  competitionGroup!: string | null;
  @ApiProperty({ nullable: true, type: String })
  competitionSubgroup!: string | null;
  @ApiProperty()
  hasResults!: boolean;
  @ApiProperty()
  hasStartlist!: boolean;
  @ApiProperty()
  hasCompetitionInformation!: boolean;
}

export class CompetitionResultAthlete {
  @ApiProperty({ nullable: true, type: Number })
  id!: number | null;
  @ApiProperty()
  firstname!: string;
  @ApiProperty()
  lastname!: string;
  @ApiProperty({ nullable: true, type: Date })
  birthdate!: Date | null;
}

export class CompetitionResult {
  @ApiProperty({ isArray: true, minimum: 1, type: CompetitionResultAthlete })
  athletes!: CompetitionResultAthlete[];
  @ApiProperty()
  country!: string;
  @ApiProperty()
  place!: number;
  @ApiProperty()
  mark!: string;
  @ApiProperty({
    description:
      'Performance in milliseconds for track events and centimeters for field events',
    nullable: true,
    type: Number,
  })
  performanceValue!: number | null;
  @ApiProperty({ nullable: true, type: Number })
  wind!: number | null;
}

export class CompetitionResultsRace {
  @ApiProperty({ nullable: true, type: Date })
  date!: Date | null;
  @ApiProperty({ nullable: true, type: Number })
  day!: number | null;
  @ApiProperty()
  race!: string;
  @ApiProperty()
  raceId!: number;
  @ApiProperty()
  raceNumber!: number;
  @ApiProperty({ isArray: true, type: CompetitionResult })
  results!: CompetitionResult[];
}

export class CompetitionResultEvent extends Discipline {
  @ApiProperty()
  eventId?: number;
  @ApiProperty({
    enum: ['M', 'W', 'X'],
  })
  sex?: Sex;
  @ApiProperty()
  isRelay?: boolean;
  @ApiProperty({ isArray: true, type: CompetitionResultsRace })
  races?: CompetitionResultsRace[];
}

export class CompetitionResults {
  @ApiProperty({ nullable: true, type: String })
  name!: string | null;
  @ApiProperty()
  rankingCategory!: string;
  @ApiProperty({ isArray: true, type: CompetitionResultEvent })
  events!: CompetitionResultEvent[];
}
