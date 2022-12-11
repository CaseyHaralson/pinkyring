import BlogService from '@<%= projectName %>/core/services/blogService';
import IBlogRepository from '@<%= projectName %>/core/interfaces/IBlogRepository';
import {mock, mockReset} from 'jest-mock-extended';
import IdempotentRequestHelper from '@<%= projectName %>/core/util/idempotentRequestHelper';
import IIdempotentRequestRepository from '@<%= projectName %>/core/interfaces/IIdempotentRequestRepository';
import Logger from '@<%= projectName %>/core/util/logger';
import EventHelper from '@<%= projectName %>/core/util/eventHelper';
import {IBaseServiceParams} from '@<%= projectName %>/core/services/baseService';
import ConfigHelper from '@<%= projectName %>/core/util/configHelper';
import Principal from '@<%= projectName %>/core/interfaces/IPrincipal';
import ISessionHandler from '@<%= projectName %>/core/interfaces/ISession';
import {IDataValidator} from '@<%= projectName %>/core/interfaces/IDataValidator';
import {Author, BlogPost} from '@<%= projectName %>/core/dtos/blogPost';
import {DATA_ACTION} from '@<%= projectName %>/core/dtos/dataActions';
import 'jest-extended';

describe('blog service unit tests', () => {
  const baseParams = mock<IBaseServiceParams>();
  baseParams.logger = mock<Logger>();
  baseParams.configHelper = mock<ConfigHelper>();
  const idempotentRequestHelper = new IdempotentRequestHelper(
    baseParams,
    mock<IIdempotentRequestRepository>()
  );
  baseParams.sessionHandler = mock<ISessionHandler>();
  baseParams.idempotentRequestHelper = idempotentRequestHelper;
  baseParams.eventHelper = mock<EventHelper>();
  const blogRepoMock = mock<IBlogRepository>();
  const authorDataValidator = mock<IDataValidator<Author>>();
  const blogPostDataValidator = mock<IDataValidator<BlogPost>>();
  const blogService = new BlogService(
    baseParams,
    blogRepoMock,
    authorDataValidator,
    blogPostDataValidator
  );
  const principal = mock<Principal>();

  beforeEach(() => {
    mockReset(baseParams.logger);
    idempotentRequestHelper.handleIdempotentRequest = jest.fn(
      (
        _: Principal,
        __: string,
        ___: string,
        ____: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requestFunc: any
      ) => {
        return requestFunc();
      }
    );
    baseParams.sessionHandler.newSessionIfNotExists = jest.fn(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_: Principal, requestFunc: any) => {
        return requestFunc();
      }
    );
    mockReset(baseParams.eventHelper);
    mockReset(blogRepoMock);
    mockReset(authorDataValidator);
    mockReset(blogPostDataValidator);
  });

  describe('get blog posts function', () => {
    test('should call repository', async () => {
      await blogService.getBlogPosts(principal, {});

      expect(blogRepoMock.getBlogPosts).toBeCalledTimes(1);
    });

    test('should call repository with ids', async () => {
      const ids = ['1', '2', '3', '4'];
      await blogService.getBlogPosts(principal, {ids: ids});

      expect(blogRepoMock.getBlogPosts).toBeCalledTimes(1);
      expect(blogRepoMock.getBlogPosts).toBeCalledWith({ids: ids});
    });

    test('should call repository with author id', async () => {
      const authorId = '1234';
      await blogService.getBlogPosts(principal, {authorId: authorId});

      expect(blogRepoMock.getBlogPosts).toBeCalledTimes(1);
      expect(blogRepoMock.getBlogPosts).toBeCalledWith({authorId: authorId});
    });

    test('should call repository with blog post title', async () => {
      const title = 'test title';
      await blogService.getBlogPosts(principal, {title: title});

      expect(blogRepoMock.getBlogPosts).toBeCalledTimes(1);
      expect(blogRepoMock.getBlogPosts).toBeCalledWith({title: title});
    });
  });

  describe('get authors function', () => {
    test('should call repository', async () => {
      await blogService.getAuthors(principal, {});

      expect(blogRepoMock.getAuthors).toBeCalledTimes(1);
    });

    test('should call repository with ids', async () => {
      const ids = ['1', '2', '3', '4'];
      await blogService.getAuthors(principal, {ids: ids});

      expect(blogRepoMock.getAuthors).toBeCalledTimes(1);
      expect(blogRepoMock.getAuthors).toBeCalledWith({ids: ids});
    });

    test('should call repository with author name', async () => {
      const name = 'test';
      await blogService.getAuthors(principal, {name: name});

      expect(blogRepoMock.getAuthors).toBeCalledTimes(1);
      expect(blogRepoMock.getAuthors).toBeCalledWith({name: name});
    });
  });

  describe('add author function', () => {
    test('should call author data validator before repository', async () => {
      const requestId = 'test_request_1234';
      const author = {
        id: '',
        name: 'test author',
      };
      await blogService.addAuthor(principal, requestId, author);

      expect(authorDataValidator.validate).toBeCalledTimes(1);
      expect(authorDataValidator.validate).toBeCalledWith(
        author,
        DATA_ACTION.CREATE
      );
      expect(authorDataValidator.validate).toHaveBeenCalledBefore(
        blogRepoMock.addAuthor as jest.MockInstance<unknown, unknown[]>
      );
    });

    test('should call repository', async () => {
      const requestId = 'test_request_1234';
      const author = {
        id: '',
        name: 'test author',
      };
      await blogService.addAuthor(principal, requestId, author);

      expect(blogRepoMock.addAuthor).toBeCalledTimes(1);
      expect(blogRepoMock.addAuthor).toBeCalledWith(author);
    });

    test('should be an idempotent request', async () => {
      const requestId = 'test_request_1234';
      const author = {
        id: '',
        name: 'test author',
      };
      await blogService.addAuthor(principal, requestId, author);

      expect(idempotentRequestHelper.handleIdempotentRequest).toBeCalledTimes(
        1
      );
      expect(
        idempotentRequestHelper.handleIdempotentRequest
      ).toHaveBeenCalledBefore(
        blogRepoMock.addAuthor as jest.MockInstance<unknown, unknown[]>
      );
    });
  });

  describe('add blog post function', () => {
    beforeEach(() => {
      blogRepoMock.addBlogPost.mockResolvedValue({
        id: 'new_blog_post_id',
        authorId: 'authorId',
        title: 'test title',
        text: 'test text',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    test('should call blog post data validator before repository', async () => {
      const requestId = 'test_request_1234';
      const blogPost = {
        id: '',
        title: 'test title',
        text: 'test text',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'authorId',
      };
      await blogService.addBlogPost(principal, requestId, blogPost);

      expect(blogPostDataValidator.validate).toBeCalledTimes(1);
      expect(blogPostDataValidator.validate).toBeCalledWith(
        blogPost,
        DATA_ACTION.CREATE
      );
      expect(blogPostDataValidator.validate).toHaveBeenCalledBefore(
        blogRepoMock.addBlogPost as jest.MockInstance<unknown, unknown[]>
      );
    });

    test('should call repository', async () => {
      const requestId = 'test_request_1234';
      const blogPost = {
        id: '',
        title: 'test title',
        text: 'test text',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'authorId',
      };
      await blogService.addBlogPost(principal, requestId, blogPost);

      expect(blogRepoMock.addBlogPost).toBeCalledTimes(1);
      expect(blogRepoMock.addBlogPost).toBeCalledWith(blogPost);
    });

    test('should be an idempotent request', async () => {
      const requestId = 'test_request_1234';
      const blogPost = {
        id: '',
        title: 'test title',
        text: 'test text',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'authorId',
      };
      await blogService.addBlogPost(principal, requestId, blogPost);

      expect(idempotentRequestHelper.handleIdempotentRequest).toBeCalledTimes(
        1
      );
      expect(
        idempotentRequestHelper.handleIdempotentRequest
      ).toHaveBeenCalledBefore(
        blogRepoMock.addBlogPost as jest.MockInstance<unknown, unknown[]>
      );
    });

    test('should publish a blog post added event', async () => {
      const requestId = 'test_request_1234';
      const blogPost = {
        id: '',
        title: 'test title',
        text: 'test text',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'authorId',
      };
      await blogService.addBlogPost(principal, requestId, blogPost);

      expect(baseParams.eventHelper.publishEvent).toBeCalledTimes(1);
    });
  });

  describe('update blog post function', () => {
    test('should call blog post data validator before repository', async () => {
      const requestId = 'test_request_1234';
      const blogPost = {
        id: '',
        title: 'test title',
        text: 'test text',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'authorId',
      };
      await blogService.updateBlogPost(principal, requestId, blogPost);

      expect(blogPostDataValidator.validate).toBeCalledTimes(1);
      expect(blogPostDataValidator.validate).toBeCalledWith(
        blogPost,
        DATA_ACTION.UPDATE
      );
      expect(blogPostDataValidator.validate).toHaveBeenCalledBefore(
        blogRepoMock.updateBlogPost as jest.MockInstance<unknown, unknown[]>
      );
    });

    test('should call repository', async () => {
      const requestId = 'test_request_1234';
      const blogPost = {
        id: '',
        title: 'test title',
        text: 'test text',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'authorId',
      };
      await blogService.updateBlogPost(principal, requestId, blogPost);

      expect(blogRepoMock.updateBlogPost).toBeCalledTimes(1);
      expect(blogRepoMock.updateBlogPost).toBeCalledWith(blogPost);
    });

    test('should be an idempotent request', async () => {
      const requestId = 'test_request_1234';
      const blogPost = {
        id: '',
        title: 'test title',
        text: 'test text',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'authorId',
      };
      await blogService.updateBlogPost(principal, requestId, blogPost);

      expect(idempotentRequestHelper.handleIdempotentRequest).toBeCalledTimes(
        1
      );
      expect(
        idempotentRequestHelper.handleIdempotentRequest
      ).toHaveBeenCalledBefore(
        blogRepoMock.updateBlogPost as jest.MockInstance<unknown, unknown[]>
      );
    });
  });
});
