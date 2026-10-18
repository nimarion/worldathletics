import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateApiKeyDto {
  @ApiProperty({ description: 'The new GraphQL API key' })
  @IsString()
  @IsNotEmpty()
  apiKey!: string;
}

export class ApiKeyResponseDto {
  @ApiProperty({ description: 'The currently configured GraphQL API key' })
  @IsString()
  apiKey!: string;
}

export class UpdateEndpointDto {
  @ApiProperty({ description: 'The new GraphQL endpoint URL' })
  @IsString()
  @IsNotEmpty()
  @IsUrl({
    require_tld: false,
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  endpoint!: string;
}

export class EndpointResponseDto {
  @ApiProperty({ description: 'The currently configured GraphQL endpoint URL' })
  @IsString()
  endpoint!: string;
}
