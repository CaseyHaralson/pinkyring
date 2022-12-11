/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {BlogPost} from '../dtos/blogPost';
import {IContext} from './IContext';
import {createDataLoaders} from './IDataLoader';
import {throwKnownErrors} from './IKnownErrorConstructable';

/** The project graphql type definitions */
export const typeDefs = `#graphql
  type BlogPost {
    id: String
    title: String
    text: String

    author: Author
  }

  type Author {
    id: String
    name: String
  }

  type Query {
    blogPosts(authorId: String, title: String): [BlogPost]
    authors(name: String): [Author]
  }

  type Mutation {
    addAuthor(requestId: String!, name: String!): Author
    addBlogPost(
      requestId: String!,
      authorId: String!, 
      title: String!,
      text: String!
    ): BlogPost
    updateBlogPost(
      requestId: String!,
      id: String!,
      title: String,
      text: String
    ): BlogPost
  }
`;

/** The project graphql data resolvers */
export const resolvers = {
  Query: {
    blogPosts(_: any, args: any, context: IContext, info: any) {
      return context.blogService.getBlogPosts(context.principal, args);
    },
    authors(_: any, args: any, context: IContext, info: any) {
      return context.blogService.getAuthors(context.principal, args);
    },
  },
  BlogPost: {
    author(obj: BlogPost, args: any, context: IContext, info: any) {
      createDataLoaders(context);
      return context.authorDataLoader?.load(obj.authorId);
    },
  },
  Mutation: {
    async addAuthor(_: any, args: any, context: IContext, info: any) {
      return await throwKnownErrors(context, async () => {
        return await context.blogService.addAuthor(
          context.principal,
          args.requestId,
          args
        );
      });
    },
    async addBlogPost(_: any, args: any, context: IContext, info: any) {
      return await throwKnownErrors(context, async () => {
        return await context.blogService.addBlogPost(
          context.principal,
          args.requestId,
          args
        );
      });
    },
    async updateBlogPost(_: any, args: any, context: IContext, info: any) {
      return await throwKnownErrors(context, async () => {
        return await context.blogService.updateBlogPost(
          context.principal,
          args.requestId,
          args
        );
      });
    },
  },
};
