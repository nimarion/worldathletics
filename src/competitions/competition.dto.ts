import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty()
  websiteUrl: string;
  @ApiProperty()
  liveStreamUrl: string;
  @ApiProperty()
  resultsUrl: string;
  @ApiProperty({ type: [ContactPerson] })
  contactPersons: ContactPerson[];
  @ApiProperty({
    type: [Map<string, string[]>],
  })
  events: any;
}
