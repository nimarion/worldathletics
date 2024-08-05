import { ApiProperty } from '@nestjs/swagger';

export class RecordAthlete {
  @ApiProperty()
  firstname: string;
  @ApiProperty()
  lastname: string;
  @ApiProperty()
  country: string;
  @ApiProperty({ nullable: true, type: Date })
  birthdate: Date | null;
  @ApiProperty()
  id: number;
}

export class Record {
  @ApiProperty()
  gender: 'women' | 'men' | 'mixed';
  @ApiProperty()
  discipline: string;
  @ApiProperty()
  date: Date;
  @ApiProperty()
  shortTrack: boolean;
  @ApiProperty()
  pending: boolean;
  @ApiProperty()
  mark: string;
  @ApiProperty({ nullable: true, type: Number })
  wind: number | null;
  @ApiProperty()
  indoor: boolean;
  @ApiProperty()
  country: string;
  @ApiProperty({ type: RecordAthlete, isArray: true })
  athletes: RecordAthlete[];
}
