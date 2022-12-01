import {BlogPost} from '@pinkyring-server-template/core/dtos/blogPost';
import {DATA_ACTION} from '@pinkyring-server-template/core/dtos/dataActions';
import {DataValidationError} from '@pinkyring-server-template/core/dtos/dataValidationError';
import BlogPostDataValidator from '@pinkyring-server-template/infrastructure_data-validations/blogPostDataValidator';
import {BLOG_POST_TITLE_LENGTH_MAX} from '@pinkyring-server-template/infrastructure_data-validations/messages';
import {generateRandomString} from '../util/dataGenerator';

describe('blog post data validator unit tests', () => {
  const validator = new BlogPostDataValidator();

  test('schema is available', () => {
    const schema = validator.getSchema();
    expect(schema).not.toBe(null);
    expect(schema).not.toBe(undefined);
  });

  describe('validate function', () => {
    describe('general data specification', () => {
      test('nothing is required', async () => {
        await validator.validate({} as BlogPost);
        expect('no error thrown').toBe('no error thrown');
      });

      test('title max length check', async () => {
        await validator.validate({
          title: generateRandomString(191),
        } as BlogPost);
        expect('no error thrown').toBe('no error thrown');

        try {
          await validator.validate({
            title: generateRandomString(192),
          } as BlogPost);
          expect('Should never get here').toBe('Got here...');
        } catch (e) {
          expect((e as DataValidationError).message).toContain(
            BLOG_POST_TITLE_LENGTH_MAX
          );
        }
      });
    });

    describe('create action', () => {
      const action = DATA_ACTION.CREATE;

      test('title is required', async () => {
        const blogPost = {
          id: '1234',
          text: 'test text',
          authorId: '12345',
        } as BlogPost;
        await validator.validate({...blogPost, title: 'test title'}, action);
        expect('no error thrown').toBe('no error thrown');

        try {
          await validator.validate(blogPost, action);
          expect('Should never get here').toBe('Got here...');
        } catch (e) {
          expect((e as DataValidationError).message).toContain(
            'title is a required field'
          );
        }
      });

      test('text is required', async () => {
        const blogPost = {
          id: '1234',
          title: 'test title',
          authorId: '12345',
        } as BlogPost;
        await validator.validate({...blogPost, text: 'test test'}, action);
        expect('no error thrown').toBe('no error thrown');

        try {
          await validator.validate(blogPost, action);
          expect('Should never get here').toBe('Got here...');
        } catch (e) {
          expect((e as DataValidationError).message).toContain(
            'text is a required field'
          );
        }
      });

      test('authorId is required', async () => {
        const blogPost = {
          id: '1234',
          title: 'test title',
          text: 'test text',
        } as BlogPost;
        await validator.validate({...blogPost, authorId: '12345'}, action);
        expect('no error thrown').toBe('no error thrown');

        try {
          await validator.validate(blogPost, action);
          expect('Should never get here').toBe('Got here...');
        } catch (e) {
          expect((e as DataValidationError).message).toContain(
            'authorId is a required field'
          );
        }
      });
    });

    describe('update action', () => {
      const action = DATA_ACTION.UPDATE;

      test('id is required', async () => {
        const blogPost = {
          title: 'test title',
          text: 'test text',
          authorId: '12345',
        } as BlogPost;
        await validator.validate({...blogPost, id: '1234'}, action);
        expect('no error thrown').toBe('no error thrown');

        try {
          await validator.validate(blogPost, action);
          expect('Should never get here').toBe('Got here...');
        } catch (e) {
          expect((e as DataValidationError).message).toContain(
            'id is a required field'
          );
        }
      });
    });
  });
});
