/**
 * The error type that will be thrown when data doesn't pass validation.
 * The error can be thrown from repositories as well.
 */
export class DataValidationError extends Error {
  errors;
  constructor(errors: string[]) {
    const message = errors.join('; ');
    super(message);
    this.errors = errors;
    this.name = 'DataValidationError';
  }
}
