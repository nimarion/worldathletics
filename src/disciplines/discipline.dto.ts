import { ApiProperty } from '@nestjs/swagger';

export class BaseDiscipline {
  @ApiProperty()
  discipline!: string;
  @ApiProperty()
  disciplineCode!: string;
}

export class Discipline extends BaseDiscipline{
  @ApiProperty({ description: "Is also true for disciplines where the 'higher' result is better like Hep/Decathlon and One hour races" })
  isTechnical!: boolean;
}