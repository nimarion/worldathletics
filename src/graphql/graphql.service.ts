import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';

@Injectable()
export class GraphqlService {
  private graphqlClient: GraphQLClient;

  constructor() {
    const graphqlHost = process.env.GRAPHQL_ENDPOINT;
    const graphqlApiKey = process.env.GRAPHQL_API_KEY;

    if (!graphqlApiKey) {
      this.graphqlClient = new GraphQLClient(graphqlHost);
    } else {
      this.graphqlClient = new GraphQLClient(graphqlHost, {
        headers: {
          'x-api-key': graphqlApiKey,
        },
      });
    }
  }

  getClient() {
    return this.graphqlClient;
  }
}
