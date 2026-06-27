import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GraphqlService } from './graphql.service';
import {
  UpdateApiKeyDto,
  ApiKeyResponseDto,
  UpdateEndpointDto,
  EndpointResponseDto,
} from './graphql.dto';
import { AdminGuard } from './admin.guard';

@ApiTags('graphql')
@Controller('graphql')
@UseGuards(AdminGuard)
@ApiHeader({
  name: 'x-admin-secret',
  required: true,
  description:
    'Admin secret to authorize accessing and modifying runtime configuration',
})
export class GraphqlController {
  constructor(private readonly graphqlService: GraphqlService) {}

  @Get('api-key')
  @ApiOkResponse({
    type: ApiKeyResponseDto,
    description: 'Returns the currently configured GraphQL API key',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid or missing admin secret, or admin secret is not set in the environment',
  })
  getApiKey(): ApiKeyResponseDto {
    return { apiKey: this.graphqlService.getApiKey() };
  }

  @Put('api-key')
  @ApiOkResponse({
    type: ApiKeyResponseDto,
    description:
      'Successfully updated and persisted the GraphQL API key at runtime',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid or missing admin secret, or admin secret is not set in the environment',
  })
  updateApiKey(@Body() body: UpdateApiKeyDto): ApiKeyResponseDto {
    this.graphqlService.updateApiKey(body.apiKey);
    return { apiKey: this.graphqlService.getApiKey() };
  }

  @Get('endpoint')
  @ApiOkResponse({
    type: EndpointResponseDto,
    description: 'Returns the currently configured GraphQL endpoint URL',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid or missing admin secret, or admin secret is not set in the environment',
  })
  getEndpoint(): EndpointResponseDto {
    return { endpoint: this.graphqlService.getEndpoint() };
  }

  @Put('endpoint')
  @ApiOkResponse({
    type: EndpointResponseDto,
    description:
      'Successfully updated and persisted the GraphQL endpoint URL at runtime',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid or missing admin secret, or admin secret is not set in the environment',
  })
  updateEndpoint(@Body() body: UpdateEndpointDto): EndpointResponseDto {
    this.graphqlService.updateEndpoint(body.endpoint);
    return { endpoint: this.graphqlService.getEndpoint() };
  }
}
