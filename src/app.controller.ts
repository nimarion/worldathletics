import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get(['health', 'healthcheck'])
  @ApiOkResponse({
    description: 'Healthcheck endpoint to verify if the application is running',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  healthcheck() {
    return { status: 'ok' };
  }
}
