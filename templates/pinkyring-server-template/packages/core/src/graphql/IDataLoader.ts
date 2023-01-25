/* eslint-disable @typescript-eslint/no-unused-vars */
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
export interface IDataLoader<K, V> {
  load(key: K): Promise<V>;
  prime(key: K, value: V): this;
}

/** List of dataloaders that can exist in the context */
export interface IDataLoaders {
  authorDataLoader?: IDataLoader<string, Author>;
}

/** Dataloader names */
export enum DATALOADER_NAME {
  AUTHOR = 'AUTHOR',
}

/**
 * Get the dataloader from the context by name.
 * Makes sure the context is loaded and creates everything necessary.
 * @param context loaded context
 * @param name name of the dataloader
 * @returns the dataloader by name
 */
export function getDataLoader(context: IContext, name: DATALOADER_NAME) {
  if (!context.dataLoaders) context.dataLoaders = {};

  if (name === DATALOADER_NAME.AUTHOR) {
    if (!context.dataLoaders.authorDataLoader)
      context.dataLoaders.authorDataLoader = createAuthorDataLoader(context);
    return context.dataLoaders.authorDataLoader;
  }
}

function createAuthorDataLoader(context: IContext) {
  return new context.dataLoaderConstructable<string, Author>(async (keys) => {
    const authors = await context.blogService.getAuthors(context.principal, {
      ids: keys as string[],
    });

    return mapObjectsToKeys(keys, authors);
  });
}

/** Helper function to map data-loaded OBJECTS back to their source request keys */
function mapObjectsToKeys<T>(
  keys: readonly string[],
  objs: T[],
  keyName = 'id'
) {
  const map: {[key: string]: T} = {};
  objs.forEach((item) => {
    map[item[keyName as keyof typeof item] as string] = item;
  });

  return keys.map((key) => map[key]);
}

/** Helper function to map data-loaded LIST OBJECTS back to their source request keys */
function mapListObjectsToKeys<T>(
  keys: readonly string[],
  objs: T[],
  keyName = 'id'
) {
  const map: {[key: string]: T[]} = {};
  objs.forEach((item) => {
    if (map[item[keyName as keyof typeof item] as string] === undefined) {
      map[item[keyName as keyof typeof item] as string] = [];
    }
    map[item[keyName as keyof typeof item] as string].push(item);
  });

  return keys.map((key) => map[key]);
}

/** Helper function to map data-loaded OBJECT VALUES back to their source request keys */
function mapObjectValuesToKeys<T, V>(
  keys: readonly string[],
  objs: T[],
  keyName = 'id',
  valueName = 'value'
) {
  const map: {[key: string]: V} = {};
  objs.forEach((item) => {
    map[item[keyName as keyof typeof item] as string] = item[
      valueName as keyof typeof item
    ] as V;
  });

  return keys.map((key) => map[key]);
}
