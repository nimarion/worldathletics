import { ApiProperty } from '@nestjs/swagger';
import { Location } from 'src/athletes/location.dto';

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
  mark: string;
  @ApiProperty({ nullable: true, type: Number })
  wind: number | null;
  @ApiProperty()
  country: string;
  @ApiProperty()
  location: Location;
  @ApiProperty({ type: RecordAthlete, isArray: true })
  athletes: RecordAthlete[];
}
