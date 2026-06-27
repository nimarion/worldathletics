import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
  endpoint!: string;
}

export class EndpointResponseDto {
  @ApiProperty({ description: 'The currently configured GraphQL endpoint URL' })
  @IsString()
  endpoint!: string;
}
