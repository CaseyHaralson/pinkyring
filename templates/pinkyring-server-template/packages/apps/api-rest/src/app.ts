import express, {NextFunction, Response, Request} from 'express';
import container from '@pinkyring-server-template/di-container/container';
// .pinkyring=EVENT_SYSTEM
import {
  EventType,
  EVENT_BUS_NAME,
} from '@pinkyring-server-template/core/dtos/events';
// .pinkyring=EVENT_SYSTEM.end
import {DataValidationError} from '@pinkyring-server-template/core/dtos/dataValidationError';

// ======================================
// Get configurations
const CONFIGKEYNAME_APPS_EXPRESS_PORT = 'APPS_EXPRESS_PORT';
const configHelper = container.resolveConfigHelper();
configHelper.registerNeededConfigurations([
  {
    name: CONFIGKEYNAME_APPS_EXPRESS_PORT,
  },
]);
const configPort = Number(
  configHelper.getConfigValue(CONFIGKEYNAME_APPS_EXPRESS_PORT)
);
const port = configPort != 0 ? configPort : 3000;
// ======================================

// create an express server
const app = express();
app.use(express.json()); // to support JSON-encoded bodies

app.get('/', (req, res) => {
  res.send('hello world!');
});

app.get('/authors', async (req, res, next) => {
  const service = container.resolveBlogService();
  const principal = container.resolvePrincipalResolver().resolve();
  service
    .getAuthors(principal, {})
    .then((result) => res.send(result))
    .catch((e) => next(e));
});

app.get('/blogposts', async (req, res, next) => {
  const service = container.resolveBlogService();
  const principal = container.resolvePrincipalResolver().resolve();
  service
    .getBlogPosts(principal, {})
    .then((result) => res.send(result))
    .catch((e) => next(e));
});

// .pinkyring=EVENT_SYSTEM
app.post('/event/queue/new', async (req, res) => {
  const newQueueName = req.body.name || req.query.name;
  if (newQueueName === undefined) {
    res.status(400).send({
      message: `the queue name wasn't set`,
    });
  }

  const eventHelper = container.resolveEventHelper();
  res.send(
    await eventHelper.createQueue(
      newQueueName,
      EVENT_BUS_NAME,
      EventType.BLOG_POST_ADDED
    )
  );
});

app.post('/event/:queuename/grab', async (req, res) => {
  const queueName = req.params.queuename;
  if (queueName === undefined) {
    res.status(400).send({
      message: `the queue name wasn't set`,
    });
  }

  const eventHelper = container.resolveEventHelper();
  const numEventsInQueue = await eventHelper.getNumEventsInQueue(queueName);
  const event = await eventHelper.getEventFromQueue(queueName);

  res.send({
    approximateNumEventsInQueue: numEventsInQueue,
    event: event,
  });
});
// .pinkyring=EVENT_SYSTEM.end

/** Handle DataValidationErrors and mark the status as 400 before sending the error back to the client */
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof DataValidationError) {
    res.status(400).send(error);
  } else next(error);
});

app.listen(port, () => {
  console.log(`express app listening on port ${port}`);
});
