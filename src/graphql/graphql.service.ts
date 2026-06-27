import { Injectable, Logger } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GraphqlService {
  private readonly logger = new Logger(GraphqlService.name);
  private graphqlClient!: GraphQLClient;
  private currentApiKey: string | undefined;
  private currentEndpoint: string | undefined;

  constructor() {
    this.currentApiKey = process.env.GRAPHQL_API_KEY;
    this.currentEndpoint = process.env.GRAPHQL_ENDPOINT;
    this.initializeClient();
  }

  private initializeClient(): void {
    if (!this.currentEndpoint) {
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

    this.graphqlClient = new GraphQLClient(this.currentEndpoint, {
      headers,
    });
  }

  getClient(): GraphQLClient {
    return this.graphqlClient;
  }

  getApiKey(): string {
    return this.currentApiKey || '';
  }

  getEndpoint(): string {
    return this.currentEndpoint || '';
  }

  updateApiKey(newApiKey: string): void {
    this.currentApiKey = newApiKey;
    process.env.GRAPHQL_API_KEY = newApiKey;

    // Persist to the local .env file
    this.persistToEnvFile('GRAPHQL_API_KEY', newApiKey);

    // Re-initialize the GraphQLClient to use the new key immediately
    this.initializeClient();
  }

  updateEndpoint(newEndpoint: string): void {
    this.currentEndpoint = newEndpoint;
    process.env.GRAPHQL_ENDPOINT = newEndpoint;

    // Persist to the local .env file
    this.persistToEnvFile('GRAPHQL_ENDPOINT', newEndpoint);

    // Re-initialize the GraphQLClient to use the new endpoint immediately
    this.initializeClient();
  }

  private persistToEnvFile(key: string, value: string): void {
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
        if (trimmed.startsWith(`${key}=`)) {
          isKeyUpdated = true;
          return `${key}="${value}"`;
        }
        return line;
      });

      if (!isKeyUpdated) {
        updatedLines.push(`${key}="${value}"`);
      }

      fs.writeFileSync(envFilePath, updatedLines.join('\n'), 'utf8');
      this.logger.log(`${key} successfully persisted to .env file.`);
    } catch (error) {
      this.logger.error(`Failed to persist ${key} to .env file:`, error);
      throw new Error(`Failed to persist ${key} on disk.`);
    }
  }
}
