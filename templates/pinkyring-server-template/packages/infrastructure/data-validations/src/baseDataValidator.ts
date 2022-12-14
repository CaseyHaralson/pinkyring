import {DataValidationError} from '@pinkyring-server-template/core/dtos/dataValidationError';
import {ValidationError} from 'yup';

/** Base class for data validation classes. */
// Doesn't extend the base class from the core because that class uses too many things
// like the logger and config helper.
// The data validation package is trying to be kept clean so it can be exported for
// external projects to consume as a way to interact with the entire project.
export default abstract class BaseDataValidator {
  /**
   * Catches validation errors and throws a data validation error defined in the core instead.
   * @param func function that can throw validation errors
   */
  protected async throwDataValidationErrorIfInvalid<T>(func: () => Promise<T>) {
    try {
      await func();
    } catch (e) {
      if (e instanceof ValidationError) {
        throw new DataValidationError(e.errors);
      }
      throw e;
    }
  }
}
