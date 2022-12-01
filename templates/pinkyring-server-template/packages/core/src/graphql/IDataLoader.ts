import {Author, BaseDTO} from '../dtos/blogPost';
import {IContext} from './IContext';

/**
 * Interface for a graphql dataloader constructable object.
 * This object should provide batch loading functionality.
 */
export interface IDataLoaderConstructable {
  new <K, V>(batchLoaderFn: BatchLoadFn<K, V>): IDataLoader<K, V>;
}

type BatchLoadFn<K, V> = (
  keys: ReadonlyArray<K>
) => PromiseLike<ArrayLike<V | Error>>;

export interface IDataLoader<K, T> {
  load(key: K): Promise<T>;
}

/** Makes sure the data loaders in the context are created before use */
export function createDataLoaders(context: IContext) {
  if (context.authorDataLoader === undefined) {
    context.authorDataLoader = new context.dataLoaderConstructable<
      string,
      Author
    >(async (keys) => {
      const authors = await context.blogService.getAuthors(context.principal, {
        ids: keys as string[],
      });

      return mapObjectsToKeys(keys, authors);
    });
  }
}

/** Helper function to map data-loaded objects back to their source request keys */
function mapObjectsToKeys<T extends BaseDTO>(
  keys: readonly string[],
  objs: T[]
) {
  const map: {[key: string]: T} = {};
  objs.forEach((item) => {
    map[item.id] = item;
  });

  return keys.map((key) => map[key]);
}
