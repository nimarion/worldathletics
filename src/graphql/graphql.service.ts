import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';

@Injectable()
export class GraphqlService {
  private graphqlClient: GraphQLClient;

  constructor() {
    const graphqlHost = process.env.GRAPHQL_ENDPOINT;
    if (!graphqlHost) {
      throw new Error('GRAPHQL_ENDPOINT is not defined');
    }
    const graphqlApiKey = process.env.GRAPHQL_API_KEY;

    const headers: { [key: string]: string } = {
      'x-graphql-client-name': process.env.GRAPHQL_CLIENT_NAME
        ? process.env.GRAPHQL_CLIENT_NAME
        : 'worldathletics',
    };
    if (graphqlApiKey) {
      headers['x-api-key'] = graphqlApiKey;
    }

    this.graphqlClient = new GraphQLClient(graphqlHost, {
      headers,
    });
  }

  getClient() {
    return this.graphqlClient;
  }
}
