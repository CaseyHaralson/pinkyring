import {
  BaseEvent,
  BlogPostAddedEvent,
  EventType,
  EVENT_BUS_NAME,
} from '@pinkyring-server-template/core/dtos/events';
import Container from '@pinkyring-server-template/di-container/container';

const eventHelper = Container.resolveEventHelper();
const principal = Container.resolvePrincipalResolver().resolveMachinePrincipal(
  'event handler service'
);

console.log('creating a queue so we can listen for blog post added events');
const queueName = 'blogPostAddedQ';
eventHelper.createQueue(queueName, EVENT_BUS_NAME, EventType.BLOG_POST_ADDED);

function eventHandler(event: BaseEvent) {
  if (event.eventType === EventType.BLOG_POST_ADDED) {
    console.log(
      `In the event handler: received blog post added event: ${JSON.stringify(
        event
      )}`
    );
    console.log(
      'going to call the mock subscription service with the event data'
    );
    const service = Container.resolveSubscriptionService();
    const eventData = (event as BlogPostAddedEvent).eventData;
    service.notifySubscribersOfNewBlogPost(
      principal,
      eventData.authorId,
      eventData.blogPostId
    );
  }
  return Promise.resolve(true);
}

console.log('listening for events...');
eventHelper.listenForEvents(queueName, eventHandler);
