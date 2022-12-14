// .pinkyring=EVENT_SYSTEM
import {
  EVENT_BUS_NAME,
  EventType,
  BlogPostAddedEvent,
} from '@pinkyring-server-template/core/dtos/events';
// .pinkyring=EVENT_SYSTEM.end
import container from '@pinkyring-server-template/di-container/container';
import {v4 as uuidv4} from 'uuid';

describe('todo service integration tests', () => {
  const service = container.resolveBlogService();
  const helperDbRepo = container.resolveIntegrationTestHelperDbRepository();
  // .pinkyring=EVENT_SYSTEM
  const helperQueueRepo =
    container.resolveIntegrationTestHelperQueueRepository();
  const eventHelper = container.resolveEventHelper();
  // .pinkyring=EVENT_SYSTEM.end

  const principal = container
    .resolvePrincipalResolver()
    .resolveMachinePrincipal('blogService integration tester');

  const queueName = 'integration_test_queue';

  beforeEach(async () => {
    // delete test blog posts
    const testBlogPosts = await service.getBlogPosts(principal, {
      title: 'integration test title',
    });
    testBlogPosts.forEach(async (blogPost) => {
      await helperDbRepo.deleteBlogPost(blogPost.id);
    });

    // delete test authors
    const testAuthors = await service.getAuthors(principal, {
      name: 'integration test author',
    });
    testAuthors.forEach(async (author) => {
      await helperDbRepo.deleteAuthor(author.id);
    });

    // .pinkyring=EVENT_SYSTEM
    // delete test queue
    await helperQueueRepo.deleteQueue(queueName);
    // .pinkyring=EVENT_SYSTEM.end
  });

  describe(`get blog posts function`, () => {
    test('should return blog posts', async () => {
      const blogPosts = await service.getBlogPosts(principal, {});

      expect(blogPosts.length).toBeGreaterThan(0);
    });
  });

  describe(`get authors function`, () => {
    test('should return authors', async () => {
      const authors = await service.getAuthors(principal, {});

      expect(authors.length).toBeGreaterThan(0);
    });
  });

  describe(`add author function`, () => {
    test('should add and return author', async () => {
      const requestId = uuidv4();
      const author = await service.addAuthor(principal, requestId, {
        id: '',
        name: 'integration test author',
      });

      expect(author).not.toBe(null);
      expect(author).not.toBe(undefined);

      const foundAuthors = await service.getAuthors(principal, {
        ids: [author.id],
      });
      expect(foundAuthors.length).toBe(1);
      expect(foundAuthors[0].name).toBe(author.name);
    });
  });

  describe(`add blog post function`, () => {
    test('should add and return blog post', async () => {
      const authors = await service.getAuthors(principal, {});

      const requestId = uuidv4();
      const blogPost = await service.addBlogPost(principal, requestId, {
        id: '',
        authorId: authors[0].id,
        title: 'integration test title',
        text: 'integration test text',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(blogPost).not.toBe(null);
      expect(blogPost).not.toBe(undefined);

      const foundBlogPosts = await service.getBlogPosts(principal, {
        ids: [blogPost.id],
      });
      expect(foundBlogPosts.length).toBe(1);
      expect(foundBlogPosts[0].authorId).toBe(blogPost.authorId);
      expect(foundBlogPosts[0].title).toBe(blogPost.title);
      expect(foundBlogPosts[0].text).toBe(blogPost.text);
    });

    // .pinkyring=EVENT_SYSTEM
    test('should publish event', async () => {
      await eventHelper.createQueue(
        queueName,
        EVENT_BUS_NAME,
        EventType.BLOG_POST_ADDED
      );

      const authors = await service.getAuthors(principal, {});

      const requestId = uuidv4();
      const blogPost = await service.addBlogPost(principal, requestId, {
        id: '',
        authorId: authors[0].id,
        title: 'integration test title',
        text: 'integration test text',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const eventFromQueue = await eventHelper.getEventFromQueue(queueName);

      expect(eventFromQueue).not.toBe(null);
      expect(eventFromQueue).not.toBe(undefined);
      if (eventFromQueue !== undefined) {
        const blogPostAddedEvent = eventFromQueue as BlogPostAddedEvent;
        expect(blogPostAddedEvent.eventType).toBe(EventType.BLOG_POST_ADDED);
        expect(blogPostAddedEvent.eventData.authorId).toBe(blogPost.authorId);
        expect(blogPostAddedEvent.eventData.blogPostId).toBe(blogPost.id);
      }
    });
    // .pinkyring=EVENT_SYSTEM.end
  });

  describe(`update blog post function`, () => {
    test('should update and return blog post', async () => {
      const authors = await service.getAuthors(principal, {});

      const createRequestId = uuidv4();
      const createBlogPost = await service.addBlogPost(
        principal,
        createRequestId,
        {
          id: '',
          authorId: authors[0].id,
          title: 'integration test title',
          text: 'integration test text',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );

      const requestId = uuidv4();
      const blogPost = await service.updateBlogPost(principal, requestId, {
        ...createBlogPost,
        title: 'updated integration test title',
        text: 'updated integration test text',
      });

      expect(blogPost).not.toBe(null);
      expect(blogPost).not.toBe(undefined);

      const foundBlogPosts = await service.getBlogPosts(principal, {
        ids: [blogPost.id],
      });
      expect(foundBlogPosts.length).toBe(1);
      expect(foundBlogPosts[0].authorId).toBe(blogPost.authorId);
      expect(foundBlogPosts[0].title).toBe(blogPost.title);
      expect(foundBlogPosts[0].text).toBe(blogPost.text);
    });
  });
});
