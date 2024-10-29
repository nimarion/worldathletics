import { ApiProperty } from '@nestjs/swagger';
import { Location } from 'src/athletes/location.dto';

export class ContactPerson {
  @ApiProperty()
  email: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  role: string;
}

export class CompetitionOrganiserInfo {
  @ApiProperty({ nullable: true })
  websiteUrl: string | null;
  @ApiProperty({ nullable: true })
  liveStreamUrl: string | null;
  @ApiProperty({ nullable: true })
  resultsUrl: string | null;
  @ApiProperty({ type: [ContactPerson] })
  contactPersons: ContactPerson[];
  @ApiProperty({
    type: [Map<string, string[]>],
  })
  events: any;
}

export class Competition {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  location: Location;
  @ApiProperty()
  rankingCategory: string;
  @ApiProperty()
  disciplines: string[];
  @ApiProperty()
  start: Date;
  @ApiProperty()
  end: Date;
  @ApiProperty({ nullable: true })
  competitionGroup: string | null;
  @ApiProperty({ nullable: true })
  competitionSubgroup: string | null;
  @ApiProperty()
  hasResults: boolean;
  @ApiProperty()
  hasStartlist: boolean;
  @ApiProperty()
  hasCompetitionInformation: boolean;
}

export class CompetitionResults {
  @ApiProperty({ nullable: true })
  name: string | null;
  @ApiProperty()
  rankingCategory: string;
  @ApiProperty()
  events: CompetitionResultEvent[];
}

export class CompetitionResultEvent {
  @ApiProperty()
  event?: string;
  eventId?: number;
  gender?: string;
  isRelay?: boolean;
  perResultWind?: boolean;
  withWind?: boolean;
  races?: any[];
}
