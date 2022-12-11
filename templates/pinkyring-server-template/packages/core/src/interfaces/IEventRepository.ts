import {BaseEvent} from '../dtos/events';

export default interface IEventRepository {
  publishEvent(event: BaseEvent): Promise<void>;
  createQueue(
    queueName: string,
    busName?: string,
    topicPattern?: string
  ): Promise<void>;
  listenForEvents(
    queueName: string,
    handlerFunc: (event: BaseEvent) => Promise<boolean>
  ): Promise<void>;
  getEventFromQueue(queueName: string): Promise<BaseEvent | null>;
  getNumEventsInQueue(queueName: string): Promise<number>;
}
