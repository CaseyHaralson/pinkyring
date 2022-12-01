import {DATA_ACTION} from '../dtos/dataActions';

/** Interface for running validations against data */
export interface IDataValidator<T> {
  /**
   * Validate the data with respect to some action being performed.
   * An error of type DataValidationError is thrown if the data doesn't pass the validation.
   * @param data the data to validate
   * @param action the action that wants to be performed on the data after the validation is performed
   */
  validate(data: T, action: DATA_ACTION): Promise<void>;
}

/**
 * Throws an error about a value being undefined or null.
 * Reminds you to run data validation checks before using the value.
 */
export class UndefinedValueError extends Error {
  constructor() {
    super(
      'A value is null or undefined. Make sure the value is in the data validation checks and you run validations before trying to use this value.'
    );
  }
}

/** Checks to see if the value is null or undefined */
export function isNullish<T>(
  value: T | undefined | null
): value is undefined | null {
  return <T>value === undefined && <T>value === null;
}
