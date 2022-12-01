import {asClass, asFunction, asValue, AwilixContainer} from 'awilix';
import ConfigHelper, {
  Environment,
} from '@pinkyring-server-template/core/util/configHelper';
import ConfigFileReader from '@pinkyring-server-template/infrastructure_util/configFileReader';
// .pinkyring=EVENT_SYSTEM
import EventHelper from '@pinkyring-server-template/core/util/eventHelper';
import LocalEventRepository from '@pinkyring-server-template/infrastructure_queue/eventRepository';
import IntegrationTestHelperQueueRepository from '@pinkyring-server-template/infrastructure_queue/integrationTestHelperQueueRepository';
// .pinkyring=SERVERLESS
import ServerEventRepository from '@pinkyring-server-template/infrastructure_aws_snqs/eventRepository';
// .pinkyring=SERVERLESS.end
// .pinkyring=EVENT_SYSTEM.end
import Logger from '@pinkyring-server-template/core/util/logger';
import LogHandler from '@pinkyring-server-template/infrastructure_util/logHandler';
import {IBaseParams} from '@pinkyring-server-template/core/util/baseClass';
import IdempotentRequestHelper from '@pinkyring-server-template/core/util/idempotentRequestHelper';
import IdempotentRequestRepository from '@pinkyring-server-template/infrastructure_relationaldb/idempotentRequestRepository';
import {IBaseServiceParams} from '@pinkyring-server-template/core/services/baseService';
import BlogService from '@pinkyring-server-template/core/services/blogService';
import BlogRepository from '@pinkyring-server-template/infrastructure_relationaldb/blogRepository';
import MaintenanceService from '@pinkyring-server-template/core/services/maintenanceService';
import PrismaClientFactory from '@pinkyring-server-template/infrastructure_relationaldb/util/prismaClientFactory';
import PrincipalResolver from '@pinkyring-server-template/infrastructure_util/principalResolver';
import SessionHandler from '@pinkyring-server-template/infrastructure_util/sessionHandler';
import SubscriptionService from '@pinkyring-server-template/core/services/subscriptionService';
import AuthorDataValidator from '@pinkyring-server-template/infrastructure_data-validations/authorDataValidator';
import BlogPostDataValidator from '@pinkyring-server-template/infrastructure_data-validations/blogPostDataValidator';
import IntegrationTestHelperDbRepository from '@pinkyring-server-template/infrastructure_relationaldb/integrationTestHelperDbRepository';

export default function loadContainer(container: AwilixContainer) {
  loadConfigHelper(container);
  const configHelper = container.cradle.configHelper as ConfigHelper;

  if (
    configHelper.getEnvironment() === Environment.DEVELOPMENT ||
    configHelper.getEnvironment() === Environment.TEST
  ) {
    loadLocalItems(container);

    if (configHelper.getEnvironment() === Environment.TEST) {
      loadTestItems(container);
    }
  } else {
    loadServerItems(container);
  }

  loadGenericItems(container);
}

const loadConfigHelper = function (container: AwilixContainer) {
  container.register({
    configHelper: asClass(ConfigHelper),
    configFileReader: asClass(ConfigFileReader).singleton(),
    secretRepository: asValue(null), // load a secrets repo here if you need it
  });
};

// ====================================
//        load local items

const loadLocalItems = function (container: AwilixContainer) {
  container.register({
    // .pinkyring=EVENT_SYSTEM
    eventRepository: asClass(LocalEventRepository),
    // .pinkyring=EVENT_SYSTEM.end
  });
};

// ====================================

// ====================================
//        load test items

const loadTestItems = function (container: AwilixContainer) {
  container.register({
    integrationTestHelperDbRepository: asClass(
      IntegrationTestHelperDbRepository
    ),
    // .pinkyring=EVENT_SYSTEM
    integrationTestHelperQueueRepository: asClass(
      IntegrationTestHelperQueueRepository
    ),
    // .pinkyring=EVENT_SYSTEM.end
  });
};

// ====================================

// ====================================
//        load server items

const loadServerItems = function (container: AwilixContainer) {
  container.register({
    // .pinkyring=EVENT_SYSTEM
    // .pinkyring=SERVERLESS
    eventRepository: asClass(ServerEventRepository),
    // .pinkyring=SERVERLESS.end
    // .pinkyring=EVENT_SYSTEM.end
  });
};

// ====================================

// ====================================
//        load generic items

const loadGenericItems = function (container: AwilixContainer) {
  // base class parameters and base service parameters
  container.register({
    logger: asClass(Logger),
    logHandler: asFunction(() => {
      const logger = new LogHandler({
        logger: null as unknown as Logger, // can't include a logger in the log handler because that creates a circular dependency, because the log handler IS the underlying logger
        configHelper: container.cradle.configHelper as ConfigHelper,
      } as IBaseParams);
      return logger;
    }).singleton(),
    baseParams: asFunction(() => {
      return {
        logger: container.cradle.logger,
        configHelper: container.cradle.configHelper,
      } as IBaseParams;
    }),
    idempotentRequestHelper: asClass(IdempotentRequestHelper),
    idempotentRequestRepository: asClass(IdempotentRequestRepository),
    // .pinkyring=EVENT_SYSTEM
    eventHelper: asClass(EventHelper),
    // .pinkyring=EVENT_SYSTEM.end
    sessionHandler: asClass(SessionHandler),
    baseServiceParams: asFunction(() => {
      return {
        logger: container.cradle.logger,
        configHelper: container.cradle.configHelper,
        idempotentRequestHelper: container.cradle.idempotentRequestHelper,
        // .pinkyring=EVENT_SYSTEM
        eventHelper: container.cradle.eventHelper,
        // .pinkyring=EVENT_SYSTEM.end
        sessionHandler: container.cradle.sessionHandler,
      } as IBaseServiceParams;
    }),
  });
  // end base class parameters and base service parameters

  container.register({
    principalResolver: asClass(PrincipalResolver),
  });

  container.register({
    maintenanceService: asClass(MaintenanceService),
    blogService: asClass(BlogService),
    blogRepository: asClass(BlogRepository),
    subscriptionService: asClass(SubscriptionService),
    authorDataValidator: asClass(AuthorDataValidator),
    blogPostDataValidator: asClass(BlogPostDataValidator),
  });

  container.register({
    prismaClientFactory: asClass(PrismaClientFactory),
    prismaClient: asFunction(() => {
      const factory = container.cradle
        .prismaClientFactory as PrismaClientFactory;
      return factory.createPrismaClient();
    }).singleton(),
  });
};

// ====================================
