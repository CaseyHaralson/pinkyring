import IBlogRepository from '@pinkyring-server-template/core/interfaces/IBlogRepository';
import {BlogPost, Author} from '@pinkyring-server-template/core/dtos/blogPost';
import {PrismaClient} from '@prisma/client';
import BaseClass, {
  IBaseParams,
} from '@pinkyring-server-template/core/util/baseClass';
import {throwDataValidationErrors} from './util/prismaErrors';
import {
  AuthorSearchCriteria,
  BlogPostSearchCriteria,
} from '@pinkyring-server-template/core/services/blogService';

/** Blog repository using prisma */
export default class BlogRepository
  extends BaseClass
  implements IBlogRepository
{
  private _prismaClient;
  constructor(baseParams: IBaseParams, prismaClient: PrismaClient) {
    super(baseParams, 'BlogRepository');
    this._prismaClient = prismaClient;
  }

  async getBlogPosts(criteria: BlogPostSearchCriteria): Promise<BlogPost[]> {
    return await this._prismaClient.blogPost.findMany({
      where: {
        id: {in: criteria.ids},
        authorId: criteria.authorId,
        title: {contains: criteria.title},
      },
    });
  }

  async getAuthors(criteria: AuthorSearchCriteria): Promise<Author[]> {
    return await this._prismaClient.author.findMany({
      where: {
        id: {in: criteria.ids},
        name: {contains: criteria.name},
      },
    });
  }

  async addAuthor(author: Author): Promise<Author> {
    return await throwDataValidationErrors(async () => {
      const dbAuthor = await this._prismaClient.author.create({
        data: {
          name: author.name,
        },
      });
      return dbAuthor;
    });
  }

  async addBlogPost(blogPost: BlogPost) {
    return await throwDataValidationErrors(async () => {
      const dbBlogPost = await this._prismaClient.blogPost.create({
        data: {
          authorId: blogPost.authorId,
          title: blogPost.title,
          text: blogPost.text,
        },
      });
      return dbBlogPost;
    });
  }

  async updateBlogPost(blogPost: BlogPost) {
    return await throwDataValidationErrors(async () => {
      const dbBlogPost = await this._prismaClient.blogPost.update({
        where: {
          id: blogPost.id,
        },
        data: {
          title: blogPost.title != null ? blogPost.title : undefined,
          text: blogPost.text != null ? blogPost.text : undefined,
        },
      });
      return dbBlogPost;
    });
  }
}
