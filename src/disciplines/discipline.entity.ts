import { ApiProperty } from '@nestjs/swagger';

export class Discipline {
  @ApiProperty()
  discipline: string;
  @ApiProperty()
  disciplineCode: string;
  @ApiProperty()
  shortTrack: boolean;
}
