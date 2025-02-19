import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { Record } from 'src/records/record.dto';
import { LeadsService } from './leads.service';
import { IsEnum, IsOptional } from 'class-validator';

class ParamsDto {
  discipline!: string;
  @IsEnum(["senior", "u20"])
  @ApiProperty({ enum: ["senior", "u20"] })
  ageGroup!: "senior" | "u20";
  @IsEnum(["M", "W", "X"])
  @ApiProperty({ enum: ["M", "W", "X"] })
  sex!: "M" | "W" | "X";
}

class QueryDto{
  @ApiProperty({ enum: ["AL", "WL", "NL"] })
  @IsEnum(["AL", "WL", "NL"])
  leadType!: "AL" | "WL" | "NL";
  @IsOptional()
  @ApiProperty({ required: false, type: String })
  region!: string | null;
}

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get(":discipline/:sex/:ageGroup")
  @ApiOkResponse({
    isArray: true,
    type: Record,
    description: 'Returns all leads for the given parameters'
  })
  async find(@Param() params: ParamsDto, @Query() query: QueryDto): Promise<Record[]> {
    if(query.leadType != 'WL' && !query.region){
      throw new BadRequestException("Region is required for this lead type");
    }
    return this.leadsService.find({
      ageGroup: params.ageGroup,
      disciplineCode: params.discipline,
      leadType: query.leadType,
      region: query.region,
      sex: params.sex
    });
  }

}
