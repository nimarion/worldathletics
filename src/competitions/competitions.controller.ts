import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
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
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
  })
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
    @Param('id', ParseIntPipe) id: number,
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
  @ApiQuery({
    name: 'day',
    required: false,
    type: Number,
  })
  @ApiOkResponse({
    type: CompetitionResults,
  })
  async findResults(
    @Param('id', ParseIntPipe) id: number,
    @Query('eventId', new ParseIntPipe({ optional: true })) eventId?: number,
    @Query('day', new ParseIntPipe({ optional: true })) day?: number,
  ): Promise<CompetitionResults> {
    if (eventId && day) {
      throw new BadRequestException('Cannot provide both eventId and day');
    }
    return await this.competitionsService.findCompetitionResults({
      competitionId: id,
      eventId,
      day,
    });
  }
}
