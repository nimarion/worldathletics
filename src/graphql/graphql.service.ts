import { Injectable, Logger } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GraphqlService {
  private readonly logger = new Logger(GraphqlService.name);
  private graphqlClient!: GraphQLClient;
  private currentApiKey: string | undefined;

  constructor() {
    this.currentApiKey = process.env.GRAPHQL_API_KEY;
    this.initializeClient();
  }

  private initializeClient(): void {
    const graphqlHost = process.env.GRAPHQL_ENDPOINT;
    if (!graphqlHost) {
      throw new Error('GRAPHQL_ENDPOINT is not defined');
    }

    const headers: { [key: string]: string } = {
      'x-graphql-client-name': process.env.GRAPHQL_CLIENT_NAME
        ? process.env.GRAPHQL_CLIENT_NAME
        : 'worldathletics',
    };
    if (this.currentApiKey) {
      headers['x-api-key'] = this.currentApiKey;
    }

    this.graphqlClient = new GraphQLClient(graphqlHost, {
      headers,
    });
  }

  getClient(): GraphQLClient {
    return this.graphqlClient;
  }

  getApiKey(): string {
    return this.currentApiKey || '';
  }

  updateApiKey(newApiKey: string): void {
    this.currentApiKey = newApiKey;
    process.env.GRAPHQL_API_KEY = newApiKey;

    // Persist to the local .env file
    this.persistToEnvFile(newApiKey);

    // Re-initialize the GraphQLClient to use the new key immediately
    this.initializeClient();
  }

  private persistToEnvFile(newApiKey: string): void {
    const envFilePath = path.join(process.cwd(), '.env');
    try {
      let fileContent = '';
      if (fs.existsSync(envFilePath)) {
        fileContent = fs.readFileSync(envFilePath, 'utf8');
      }

      const lines = fileContent.split('\n');
      let isKeyUpdated = false;

      const updatedLines = lines.map((line) => {
        const trimmed = line.trim();
        // Match GRAPHQL_API_KEY with or without comments/spaces
        if (trimmed.startsWith('GRAPHQL_API_KEY=')) {
          isKeyUpdated = true;
          return `GRAPHQL_API_KEY="${newApiKey}"`;
        }
        return line;
      });

      if (!isKeyUpdated) {
        updatedLines.push(`GRAPHQL_API_KEY="${newApiKey}"`);
      }

      fs.writeFileSync(envFilePath, updatedLines.join('\n'), 'utf8');
      this.logger.log('GRAPHQL_API_KEY successfully persisted to .env file.');
    } catch (error) {
      this.logger.error(
        'Failed to persist GRAPHQL_API_KEY to .env file:',
        error,
      );
      throw new Error('Failed to persist API key on disk.');
    }
  }
}
