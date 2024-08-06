import { ApiProperty } from '@nestjs/swagger';
import { BaseAthlete, BasePerformance } from 'src/athletes/athlete.dto';

export class Record extends BasePerformance {
  @ApiProperty()
  gender: 'women' | 'men' | 'mixed';
  @ApiProperty()
  country: string;
  @ApiProperty({ type: BaseAthlete, isArray: true })
  athletes: BaseAthlete[];
}

export class RecordCategory {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
}
