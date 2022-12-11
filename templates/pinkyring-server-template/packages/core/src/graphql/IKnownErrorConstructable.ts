import {DataValidationError} from '../dtos/dataValidationError';
import {IContext} from './IContext';

/**
 * Error type that should be constructed when encountering a known error.
 * Probably some sort of specific type that can make it through the graphql engine
 * and give known errors visibility to the user.
 */
export interface IKnownErrorConstructable {
  new (message: string): void;
}

/**
 * Catches errors of known types and instead throws errors of IKnownErrorConstructable.
 * Returns the value from the func if there are no errors.
 *
 * @param context graphql context object
 * @param func the function to run and catch errors from
 * @returns returns the value from the func
 */
export async function throwKnownErrors<T>(
  context: IContext,
  func: () => Promise<T>
) {
  try {
    return await func();
  } catch (e) {
    if (e instanceof DataValidationError) {
      throw new context.knownErrorConstructable(e.message);
    }
    throw e;
  }
}
