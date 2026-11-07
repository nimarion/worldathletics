import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientError, GraphQLClient } from 'graphql-request';

const BASE_URL = 'https://worldathletics.org';
const PAGE_PATH = '/athletes/-/14193865';
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const SCRIPT_SRC_PATTERN = /src="(\/_next\/static\/[^"]+\.js)"/g;
const GRAPHQL_BLOCK_PATTERN = /(?:^|[,{])graphql:\{([^}]+)\}/g;
const ENDPOINT_PATTERN = /(?:^|[,{])endpoint:"([^"]+)"/;
const API_KEY_PATTERN = /(?:^|[,{])apiKey:"([^"]+)"/;

const REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours
const FETCH_TIMEOUT_MS = 10_000;
const FETCH_RETRIES = 3;

interface GraphqlCredentials {
  endpoint: string;
  apiKey: string;
}

@Injectable()
export class GraphqlService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GraphqlService.name);
  private rawClient: GraphQLClient | null = null;
  private readonly clientProxy: GraphQLClient;
  private refreshPromise: Promise<void> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.clientProxy = {
      request: async (...args: Parameters<GraphQLClient['request']>) => {
        if (!this.rawClient) {
          await this.refreshCredentials();
        }
        try {
          return await (
            this.rawClient!.request as (
              ...a: Parameters<GraphQLClient['request']>
            ) => Promise<unknown>
          )(...args);
        } catch (error) {
          if (this.isAuthError(error)) {
            this.logger.warn(
              'GraphQL request failed with auth error; refreshing credentials and retrying...',
            );
            await this.refreshCredentials();
            return await (
              this.rawClient!.request as (
                ...a: Parameters<GraphQLClient['request']>
              ) => Promise<unknown>
            )(...args);
          }
          throw error;
        }
      },
    } as GraphQLClient;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.refreshCredentials();
    } catch (error) {
      this.logger.error(
        'Failed to fetch initial GraphQL credentials on startup (will retry on next request):',
        error,
      );
    }

    this.refreshTimer = setInterval(() => {
      this.refreshCredentials().catch((error) => {
        this.logger.error(
          'Scheduled GraphQL credentials refresh failed:',
          error,
        );
      });
    }, REFRESH_INTERVAL_MS);
    this.refreshTimer.unref();
  }

  onModuleDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  getClient(): GraphQLClient {
    return this.clientProxy;
  }

  async refreshCredentials(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefreshCredentials().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async doRefreshCredentials(): Promise<void> {
    const { endpoint, apiKey } = await this.fetchCredentials();
    this.rawClient = new GraphQLClient(endpoint, {
      headers: {
        'x-graphql-client-name': 'worldathletics',
        'x-api-key': apiKey,
      },
    });
    this.logger.log(`GraphQL credentials updated (endpoint: ${endpoint})`);
  }

  private async fetchCredentials(): Promise<GraphqlCredentials> {
    const html = await this.fetchWithRetry(PAGE_PATH);
    const scriptMatches = html.matchAll(SCRIPT_SRC_PATTERN);

    for (const match of scriptMatches) {
      const scriptPath = match[1];
      const js = await this.fetchWithRetry(scriptPath);
      const blockMatches = js.matchAll(GRAPHQL_BLOCK_PATTERN);

      for (const blockMatch of blockMatches) {
        const block = blockMatch[1];
        const endpointMatch = ENDPOINT_PATTERN.exec(block);
        const apiKeyMatch = API_KEY_PATTERN.exec(block);

        if (endpointMatch && apiKeyMatch) {
          return {
            endpoint: endpointMatch[1],
            apiKey: apiKeyMatch[1],
          };
        }
      }
    }

    throw new Error(
      'Failed to extract GraphQL endpoint and API key from World Athletics static bundles',
    );
  }

  private async fetchWithRetry(path: string): Promise<string> {
    const url = `${BASE_URL}${path}`;
    for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': USER_AGENT,
          },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        if (response.ok) {
          return await response.text();
        }
      } catch {
        // Retry up to FETCH_RETRIES times
      }
    }
    throw new Error(`Failed to fetch ${url} after ${FETCH_RETRIES} attempts`);
  }

  private isAuthError(error: unknown): boolean {
    if (!(error instanceof ClientError)) {
      return false;
    }

    const status = error.response.status;
    if (status === 401 || status === 403) {
      return true;
    }

    const errors = error.response.errors;
    if (Array.isArray(errors)) {
      return errors.some((err) => {
        const record = err as unknown as Record<string, unknown>;
        const errorType =
          typeof record.errorType === 'string' ? record.errorType : '';
        const message =
          typeof record.message === 'string' ? record.message : '';
        return (
          errorType === 'UnauthorizedException' ||
          errorType === 'BadApiKeyException' ||
          /unauthorized|not authorized|api.?key/i.test(message)
        );
      });
    }

    return false;
  }
}
