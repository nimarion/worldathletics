import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import {
  Competition,
  CompetitionOrganiserInfo,
  CompetitionResults,
} from './competition.dto';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';

@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get()
  @ApiOkResponse({
    type: Competition,
    isArray: true,
  })
  findAll(@Query('name') name?: string): Promise<Competition[]> {
    return this.competitionsService.findCompetitions({
      query: name,
    });
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

  @Get(':id/results')
  @ApiQuery({
    name: 'eventId',
    required: false,
    type: Number,
  })
  async findResults(
    @Param('id') id: number,
    @Query('eventId') eventId?: number,
  ): Promise<CompetitionResults[]> {
    return await this.competitionsService.findCompetitionResults({
      competitionId: id,
      eventId,
    });
  }
}
