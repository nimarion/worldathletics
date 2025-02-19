import { ApiProperty } from '@nestjs/swagger';
import { BaseAthlete, BasePerformance, Sex } from 'src/athletes/athlete.dto';

export class Record extends BasePerformance {
  @ApiProperty()
  place!: number;
  @ApiProperty({
    enum: ['M', 'W', 'X'],
  })
  sex!: Sex;
  @ApiProperty()
  country!: string;
  @ApiProperty({ type: BaseAthlete, isArray: true })
  athletes!: BaseAthlete[];
}

export class RecordCategory {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  name!: string;
}
