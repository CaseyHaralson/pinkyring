import {DataValidationError} from '@pinkyring-server-template/core/dtos/dataValidationError';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime';

/** Prisma error codes for different scenarios */
export enum ERROR_CODE {
  UNIQUE_CONSTRAINT = 'P2002',
}

/**
 * Catches known errors from prisma and tries to throw data validation errors instead.
 * @param func the function to run
 * @returns the result from the function
 */
export async function throwDataValidationErrors<T>(func: () => Promise<T>) {
  try {
    return await func();
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === ERROR_CODE.UNIQUE_CONSTRAINT)
        throwUniqueConstraintError(e.meta?.target as string);
    }
    throw e;
  }
}

/** Throws data validation error based on unique constraint target */
function throwUniqueConstraintError(target: string) {
  if (target === 'Author_name_key') {
    throw new DataValidationError([`the author name must be unique`]);
  }
  if (target === 'BlogPost_authorId_title_key') {
    throw new DataValidationError([
      `the blog post title must be unique per author`,
    ]);
  }
}
