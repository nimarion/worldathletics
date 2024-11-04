import { ApiProperty } from '@nestjs/swagger';

export class Discipline {
  @ApiProperty()
  discipline!: string;
  @ApiProperty()
  disciplineCode!: string;
  @ApiProperty({ required: false })
  isTechnical?: boolean;
}
