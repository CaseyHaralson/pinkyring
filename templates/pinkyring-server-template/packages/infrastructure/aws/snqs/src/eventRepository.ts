import IEventRepository from '@pinkyring-server-template/core/interfaces/IEventRepository';
import {
  BaseEvent,
  EventType,
} from '@pinkyring-server-template/core/dtos/events';
import {SNS} from '@aws-sdk/client-sns';
import BaseClass, {
  IBaseParams,
} from '@pinkyring-server-template/core/util/baseClass';

const CONFIGKEYNAME_AWS_REGION = 'AWS_REGION'; // env variable set by AWS
const CONFIGKEYNAME_BLOGPOST_ADDED_TOPIC_ARN = 'BLOGPOST_ADDED_TOPIC_ARN';

/** Event repository using AWS SNS */
export default class EventRepository
  extends BaseClass
  implements IEventRepository
{
  constructor(baseParams: IBaseParams) {
    super(baseParams, 'EventRepository', [
      {
        name: CONFIGKEYNAME_AWS_REGION,
      },
      {
        name: CONFIGKEYNAME_BLOGPOST_ADDED_TOPIC_ARN,
      },
    ]);
  }

  async publishEvent(event: BaseEvent): Promise<void> {
    let topicArn = undefined;
    if (event.eventType === EventType.BLOG_POST_ADDED) {
      topicArn = this.getConfigValue(CONFIGKEYNAME_BLOGPOST_ADDED_TOPIC_ARN);
    }

    if (topicArn) {
      const client = new SNS({
        region: this.getConfigValue(CONFIGKEYNAME_AWS_REGION),
      });
      await client.publish({
        Message: JSON.stringify(event),
        TopicArn: topicArn,
        MessageGroupId: event.eventType,
      });
    }
  }

  createQueue(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  listenForEvents(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getEventFromQueue(): Promise<BaseEvent | null> {
    throw new Error('Method not implemented.');
  }

  async getNumEventsInQueue(): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
