import {Author, BlogPost} from '../dtos/blogPost';
// .pinkyring=EVENT_SYSTEM
import {BlogPostAddedEvent, EventType} from '../dtos/events';
// .pinkyring=EVENT_SYSTEM.end
import Principal from '../interfaces/IPrincipal';
import IBlogRepository from '../interfaces/IBlogRepository';
import BaseService, {IBaseServiceParams} from './baseService';
import {IDataValidator} from '../interfaces/IDataValidator';
import {DATA_ACTION} from '../dtos/dataActions';

/** Exposes blog functions for the project. */
export default class BlogService extends BaseService {
  private _blogRepository;
  private _authorDataValidator;
  private _blogPostDataValidator;
  constructor(
    baseServiceParams: IBaseServiceParams,
    blogRepository: IBlogRepository,
    authorDataValidator: IDataValidator<Author>,
    blogPostDataValidator: IDataValidator<BlogPost>
  ) {
    super(baseServiceParams, 'BlogService');
    this._blogRepository = blogRepository;
    this._authorDataValidator = authorDataValidator;
    this._blogPostDataValidator = blogPostDataValidator;
  }

  /**
   * Gets blog posts based on the filters.
   * @param principal the current security principal
   * @param criteria search criteria when finding the blog posts
   * @returns a list of blog posts that match the filters
   */
  async getBlogPosts(principal: Principal, criteria: BlogPostSearchCriteria) {
    return await this.session(principal, async () => {
      this._logger.info('entering the get blog posts function');

      // can use principal to authorize request

      return await this._blogRepository.getBlogPosts(criteria);
    });
  }

  /**
   * Gets blog authors based on the filters.
   * @param principal the current security principal
   * @param criteria search criteria when finding the authors
   * @returns a list of authors that match the filters
   */
  async getAuthors(principal: Principal, criteria: AuthorSearchCriteria) {
    return await this.session(principal, async () => {
      this._logger.info('entering the get authors function');

      // can use principal to authorize request

      return await this._blogRepository.getAuthors(criteria);
    });
  }

  /**
   * Add an author.
   * @param principal the current security principal
   * @param requestId an id to make sure the request is handled idempotently
   * @param author the author data
   * @returns the author
   */
  async addAuthor(principal: Principal, requestId: string, author: Author) {
    return await this.session(principal, async () => {
      this._logger.info('entering the add author function');

      await this._authorDataValidator.validate(author, DATA_ACTION.CREATE);

      // can use principal to authorize request

      return this.idempotentRequest(principal, 'addAuthor', requestId, () => {
        this._logger.info('calling the repo to add the author');
        return this._blogRepository.addAuthor(author);
      });
    });
  }

  /**
   * Add a blog post. Also publishes the event if the blog post is created.
   * @param principal the current security principal
   * @param requestId an id to make sure the request is handled idempotently
   * @param blogPost the blog post data
   * @returns the blog post
   */
  async addBlogPost(
    principal: Principal,
    requestId: string,
    blogPost: BlogPost
  ) {
    return await this.session(principal, async () => {
      this._logger.info('entering the add blog post function');

      await this._blogPostDataValidator.validate(blogPost, DATA_ACTION.CREATE);

      // can use principal to authorize request

      let blogPostAdded = false;
      const requestResult = await this.idempotentRequest(
        principal,
        'addBlogPost',
        requestId,
        async () => {
          this._logger.info('calling the repo to add the blog post');
          const result = await this._blogRepository.addBlogPost(blogPost);
          blogPostAdded = result != undefined;
          return result;
        }
      );

      // .pinkyring=EVENT_SYSTEM
      if (blogPostAdded) {
        this._logger.info('publishing the blog post added event');
        await this.publishEvent({
          eventType: EventType.BLOG_POST_ADDED,
          eventData: {
            authorId: requestResult.authorId,
            blogPostId: requestResult.id,
          },
        } as BlogPostAddedEvent);
      }
      // .pinkyring=EVENT_SYSTEM.end

      return requestResult;
    });
  }

  /**
   * Updates a blog post.
   * @param principal the current security principal
   * @param requestId an id to make sure the request is handled idempotently
   * @param blogPost the updated blog post data
   * @returns the blog post
   */
  async updateBlogPost(
    principal: Principal,
    requestId: string,
    blogPost: BlogPost
  ) {
    return await this.session(principal, async () => {
      this._logger.info('entering the update blog post function');

      await this._blogPostDataValidator.validate(blogPost, DATA_ACTION.UPDATE);

      // can use principal to authorize request

      return this.idempotentRequest(
        principal,
        'updateBlogPost',
        requestId,
        () => {
          this._logger.info('calling the repo to update the author');
          return this._blogRepository.updateBlogPost(blogPost);
        }
      );
    });
  }
}

export interface BlogPostSearchCriteria {
  ids?: string[];
  authorId?: string;
  title?: string;
}

export interface AuthorSearchCriteria {
  ids?: string[];
  name?: string;
}
