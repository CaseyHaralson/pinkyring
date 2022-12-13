import {asClass, asFunction, asValue, AwilixContainer} from 'awilix';
import ConfigHelper, {
  Environment,
} from '@<%= projectName %>/core/util/configHelper';
import ConfigFileReader from '@<%= projectName %>/infrastructure_util/configFileReader';
import LocalEventRepository from '@<%= projectName %>/infrastructure_queue/eventRepository';
// .pinkyring=SERVERLESS
import ServerEventRepository from '@<%= projectName %>/infrastructure_aws_snqs/eventRepository';
// .pinkyring=SERVERLESS.end
import Logger from '@<%= projectName %>/core/util/logger';
import LogHandler from '@<%= projectName %>/infrastructure_util/logHandler';
import {IBaseParams} from '@<%= projectName %>/core/util/baseClass';
import IdempotentRequestHelper from '@<%= projectName %>/core/util/idempotentRequestHelper';
import IdempotentRequestRepository from '@<%= projectName %>/infrastructure_relationaldb/idempotentRequestRepository';
import EventHelper from '@<%= projectName %>/core/util/eventHelper';
import {IBaseServiceParams} from '@<%= projectName %>/core/services/baseService';
import BlogService from '@<%= projectName %>/core/services/blogService';
import BlogRepository from '@<%= projectName %>/infrastructure_relationaldb/blogRepository';
import MaintenanceService from '@<%= projectName %>/core/services/maintenanceService';
import PrismaClientFactory from '@<%= projectName %>/infrastructure_relationaldb/util/prismaClientFactory';
import PrincipalResolver from '@<%= projectName %>/infrastructure_util/principalResolver';
import SessionHandler from '@<%= projectName %>/infrastructure_util/sessionHandler';
import SubscriptionService from '@<%= projectName %>/core/services/subscriptionService';
import AuthorDataValidator from '@<%= projectName %>/infrastructure_data-validations/authorDataValidator';
import BlogPostDataValidator from '@<%= projectName %>/infrastructure_data-validations/blogPostDataValidator';
import IntegrationTestHelperDbRepository from '@<%= projectName %>/infrastructure_relationaldb/integrationTestHelperDbRepository';
import IntegrationTestHelperQueueRepository from '@<%= projectName %>/infrastructure_queue/integrationTestHelperQueueRepository';

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
    eventRepository: asClass(LocalEventRepository),
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
    integrationTestHelperQueueRepository: asClass(
      IntegrationTestHelperQueueRepository
    ),
  });
};

// ====================================

// ====================================
//        load server items

const loadServerItems = function (container: AwilixContainer) {
  container.register({
    // .pinkyring=SERVERLESS
    eventRepository: asClass(ServerEventRepository),
    // .pinkyring=SERVERLESS.end
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
    eventHelper: asClass(EventHelper),
    sessionHandler: asClass(SessionHandler),
    baseServiceParams: asFunction(() => {
      return {
        logger: container.cradle.logger,
        configHelper: container.cradle.configHelper,
        idempotentRequestHelper: container.cradle.idempotentRequestHelper,
        eventHelper: container.cradle.eventHelper,
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
