import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { Competition, CompetitionOrganiserInfo } from './competition.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get()
  @ApiOkResponse({
    type: Competition,
    isArray: true,
  })
  findAll(
    @Query('name') name?: string,): Promise<Competition[]> {
    return this.competitionsService.findCompetitions({
      query: name
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(id);
    return null;
  }

  @Get(':id/organiser')
  @ApiOkResponse({
    type: CompetitionOrganiserInfo,
  })
  async findOrganiser(
    @Param('id') id: number,
  ): Promise<CompetitionOrganiserInfo> {
    const data =
      await this.competitionsService.findCompetitionOrganiserInfo(id);
    if (!data) {
      throw new NotFoundException();
    }
    return data;
  }
}
