import {Author} from '@pinkyring-server-template/core/dtos/blogPost';
import {DATA_ACTION} from '@pinkyring-server-template/core/dtos/dataActions';
import {DataValidationError} from '@pinkyring-server-template/core/dtos/dataValidationError';
import AuthorDataValidator from '@pinkyring-server-template/infrastructure_data-validations/authorDataValidator';
import {AUTHOR_NAME_LENGTH_MAX} from '@pinkyring-server-template/infrastructure_data-validations/messages';
import {generateRandomString} from '../util/dataGenerator';

describe('author data validator unit tests', () => {
  const validator = new AuthorDataValidator();

  test('schema is available', () => {
    const schema = validator.getSchema();
    expect(schema).not.toBe(null);
    expect(schema).not.toBe(undefined);
  });

  describe('validate function', () => {
    describe('general data specification', () => {
      test('nothing is required', async () => {
        await validator.validate({} as Author);
        expect('no error thrown').toBe('no error thrown');
      });

      test('name max length check', async () => {
        await validator.validate({name: generateRandomString(191)} as Author);
        expect('no error thrown').toBe('no error thrown');

        try {
          await validator.validate({name: generateRandomString(192)} as Author);
          expect('Should never get here').toBe('Got here...');
        } catch (e) {
          expect((e as DataValidationError).message).toContain(
            AUTHOR_NAME_LENGTH_MAX
          );
        }
      });
    });

    describe('create action', () => {
      const action = DATA_ACTION.CREATE;

      test('name is required', async () => {
        const author = {
          id: '1234',
        } as Author;
        await validator.validate({...author, name: 'test name'}, action);
        expect('no error thrown').toBe('no error thrown');

        try {
          await validator.validate(author, action);
          expect('Should never get here').toBe('Got here...');
        } catch (e) {
          expect((e as DataValidationError).message).toContain(
            'name is a required field'
          );
        }
      });
    });

    describe('update action', () => {
      const action = DATA_ACTION.UPDATE;

      test('id is required', async () => {
        const author = {
          name: 'test name',
        } as Author;
        await validator.validate({...author, id: '1234'}, action);
        expect('no error thrown').toBe('no error thrown');

        try {
          await validator.validate(author, action);
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
