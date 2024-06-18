import { ApiProperty } from '@nestjs/swagger';

export class CompetitionOrganiserInfo {
  @ApiProperty()
  websiteUrl: string;
  @ApiProperty()
  liveStreamUrl: string;
  @ApiProperty()
  resultsUrl: string;
  @ApiProperty()
  events: any[];
  @ApiProperty()
  contactPersons: ContactPerson[];
}

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
