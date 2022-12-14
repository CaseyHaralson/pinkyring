import {createContainer, AwilixContainer} from 'awilix';
import BlogService from '@pinkyring-server-template/core/services/blogService';
// .pinkyring=EVENT_SYSTEM
import EventHelper from '@pinkyring-server-template/core/util/eventHelper';
import IntegrationTestHelperQueueRepository from '@pinkyring-server-template/infrastructure_queue/integrationTestHelperQueueRepository';
// .pinkyring=EVENT_SYSTEM.end
import ConfigHelper, {
  Environment,
} from '@pinkyring-server-template/core/util/configHelper';
import MaintenanceService from '@pinkyring-server-template/core/services/maintenanceService';
import loadContainer from './containerLoader';
import PrincipalResolver from '@pinkyring-server-template/infrastructure_util/principalResolver';
import SubscriptionService from '@pinkyring-server-template/core/services/subscriptionService';
import IntegrationTestHelperDbRepository from '@pinkyring-server-template/infrastructure_relationaldb/integrationTestHelperDbRepository';

const awilix_container = createContainer({injectionMode: 'CLASSIC'});

/**
 * Exposes services and other helpers that allow the external apps to use the core project.
 */
class Container {
  private _container;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(container: AwilixContainer<any>) {
    this._container = container;
  }

  resolveBlogService() {
    return this._container.cradle.blogService as BlogService;
  }

  resolveMaintenanceService() {
    return this._container.cradle.maintenanceService as MaintenanceService;
  }

  resolveSubscriptionService() {
    return this._container.cradle.subscriptionService as SubscriptionService;
  }

  /**
   * Resolves the configured PrincipalResolver object.
   * This is exposed so external apps can use their knowledge of the current request to help resolve the security principal.
   * @returns PrincipalResolver
   */
  resolvePrincipalResolver() {
    return this._container.cradle.principalResolver as PrincipalResolver;
  }

  /**
   * Resolves the configured ConfigHelper object.
   * This is exposed so external apps can get their configurations from the same location as the rest of the project.
   * @returns ConfigHelper
   */
  resolveConfigHelper() {
    return this._container.cradle.configHelper as ConfigHelper;
  }

  // .pinkyring=EVENT_SYSTEM
  /**
   * Resolves the configured EventHelper object.
   * This is exposed so an event listener app can interact with the underlying event system.
   * @returns EventHelper
   */
  resolveEventHelper() {
    return this._container.cradle.eventHelper as EventHelper;
  }
  // .pinkyring=EVENT_SYSTEM.end

  // ==================================================
  //             TEST ENVIRONMENT ONLY

  /** Test environment only: Resolves the configured IntegrationTestHelperDbRepository. */
  resolveIntegrationTestHelperDbRepository() {
    if (this.resolveConfigHelper().getEnvironment() !== Environment.TEST) {
      throw new Error(
        `This can only be resolved in the test environment. This shouldn't be used during regular development.`
      );
    }
    return this._container.cradle
      .integrationTestHelperDbRepository as IntegrationTestHelperDbRepository;
  }

  // .pinkyring=EVENT_SYSTEM
  /** Test environment only: Resolves the configured IntegrationTestHelperQueueRepository. */
  resolveIntegrationTestHelperQueueRepository() {
    if (this.resolveConfigHelper().getEnvironment() !== Environment.TEST) {
      throw new Error(
        `This can only be resolved in the test environment. This shouldn't be used during regular development.`
      );
    }
    return this._container.cradle
      .integrationTestHelperQueueRepository as IntegrationTestHelperQueueRepository;
  }
  // .pinkyring=EVENT_SYSTEM.end

  // ==================================================
}

loadContainer(awilix_container);

/**
 * The DI container that is configured with the project objects.
 * It exposes services and other helpers that allow the external apps to use the core project.
 */
const container = new Container(awilix_container);
export default container;
