import { ApiProperty } from '@nestjs/swagger';
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

export class CompetitionResults {
  @ApiProperty({ nullable: true })
  name!: string | null;
  @ApiProperty()
  rankingCategory!: string;
  @ApiProperty()
  events!: CompetitionResultEvent[];
}

export class CompetitionResultEvent {
  @ApiProperty()
  event?: string;
  eventId?: number;
  sex?: string;
  isRelay?: boolean;
  perResultWind?: boolean;
  withWind?: boolean;
  races?: any[];
}
