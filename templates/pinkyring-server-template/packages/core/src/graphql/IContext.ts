import Principal from '../interfaces/IPrincipal';
import BlogService from '../services/blogService';
import {IDataLoaderConstructable, IDataLoaders} from './IDataLoader';
import {IKnownErrorConstructable} from './IKnownErrorConstructable';

/** Context object that should be loaded and injected into the resolver functions. */
export interface IContext {
  principal: Principal;
  blogService: BlogService;
  dataLoaderConstructable: IDataLoaderConstructable;
  knownErrorConstructable: IKnownErrorConstructable;
  dataLoaders?: IDataLoaders;
}
