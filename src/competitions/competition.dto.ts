import { ApiProperty } from '@nestjs/swagger';
import { BaseAthlete, BasePerformance, Sex } from 'src/athletes/athlete.dto';
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

export class CompetitionResult extends BasePerformance {
  @ApiProperty({ isArray: true, minimum: 1, type: BaseAthlete })
  athletes!: BaseAthlete[];
  @ApiProperty()
  country!: string;
  @ApiProperty()
  place!: number;
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
  @ApiProperty({ nullable: true, type: String })
  eventName!: string | null;
  @ApiProperty()
  eventId!: number;
  @ApiProperty()
  category!: string;
  @ApiProperty({
    enum: ['M', 'W', 'X'],
  })
  sex!: Sex;
  @ApiProperty({ isArray: true, type: CompetitionResultsRace })
  races!: CompetitionResultsRace[];
}

export class CompetitionResultOptionDay {
  @ApiProperty()
  date!: Date;
  @ApiProperty()
  day!: number
}

export class CompetitionResultOptionEvent {
  @ApiProperty()
  id!: number;
  @ApiProperty({
    enum: ['M', 'W', 'X'],
  })
  sex!: Sex;
  @ApiProperty()
  combined!: boolean;
  @ApiProperty()
  discipline!: string;
  @ApiProperty()
  disciplineCode!: string;
  @ApiProperty()
  shortTrack!: boolean;
}

export class CompetitionResultOptions {
  @ApiProperty({ isArray: true, type: CompetitionResultOptionDay })
  days! : CompetitionResultOptionDay[];
  @ApiProperty({ isArray: true, type: CompetitionResultOptionEvent })
  events! : CompetitionResultOptionEvent[];
}

export class CompetitionResults {
  @ApiProperty({ isArray: true, type: CompetitionResultEvent })
  events!: CompetitionResultEvent[];
  @ApiProperty()
  options!: CompetitionResultOptions;
}

