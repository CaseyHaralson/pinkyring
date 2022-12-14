import {
  BaseEvent,
  BlogPostAddedEvent,
  EventType,
} from '@pinkyring-server-template/core/dtos/events';
import {SQSEvent} from 'aws-lambda';
import Container from '@pinkyring-server-template/di-container/container';

const mockService = Container.resolveSubscriptionService();
const principal = Container.resolvePrincipalResolver().resolveMachinePrincipal(
  'AWS BlogPost Added Event Handler'
);

/** lambda handler function */
export const handler = async (event: SQSEvent) => {
  console.log(`The blog post added event handler has been entered...`);

  const numRecords = event.Records.length;
  console.log(`Received ${numRecords} records`);

  for (const record of event.Records) {
    console.log(`Got record: ${record.body}`);

    console.log(`Trying to get event from the record...`);
    const recordBody = JSON.parse(record.body);
    if (recordBody.Message) {
      const message = JSON.parse(recordBody.Message) as BaseEvent;
      console.log(`Parsed event from record: ${message.eventType}`);
      console.log(
        `Parsed event data from record: ${JSON.stringify(message.eventData)}`
      );

      if (message.eventType === EventType.BLOG_POST_ADDED) {
        console.log(
          'going to call the mock subscription service with the event data'
        );
        const eventData = (message as BlogPostAddedEvent).eventData;
        mockService.notifySubscribersOfNewBlogPost(
          principal,
          eventData.authorId,
          eventData.blogPostId
        );
      }
    } else {
      console.log(`Couldn't get the event from the record...`);
    }
  }
};
