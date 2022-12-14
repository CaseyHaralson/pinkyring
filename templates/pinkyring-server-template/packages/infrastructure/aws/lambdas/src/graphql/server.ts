import {ApolloServer} from '@apollo/server';
import {startServerAndCreateLambdaHandler} from '@as-integrations/aws-lambda';
import {
  resolvers,
  typeDefs,
} from '@pinkyring-server-template/core/graphql/schema';
import {IContext} from '@pinkyring-server-template/core/graphql/IContext';
import container from '@pinkyring-server-template/di-container/container';
import DataLoader from 'dataloader';
import {GraphQLError} from 'graphql';

const server = new ApolloServer<IContext>({
  typeDefs,
  resolvers,
});

/** lambda handler function */
export const graphqlHandler = startServerAndCreateLambdaHandler(server, {
  context: async () => {
    // can resolve principal with header or something here
    const principal = container.resolvePrincipalResolver().resolve();

    return {
      principal: principal,
      blogService: container.resolveBlogService(),
      dataLoaderConstructable: DataLoader,
      knownErrorConstructable: GraphQLError,
    } as IContext;
  },
});
