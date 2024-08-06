import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { RecordsService } from './records.service';
import { Record } from './record.entity';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get(':id')
  @ApiOkResponse({
    isArray: true,
    type: Record,
    description: 'Returns all records for a given category',
  })
  async find(@Param('id') id: number): Promise<Record[]> {
    const records = await this.recordsService.find(id);
    if (!records) {
      throw new NotFoundException();
    }
    return records;
  }
}
