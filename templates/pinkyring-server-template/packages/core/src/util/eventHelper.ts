import {BaseEvent} from '../dtos/events';
import IEventRepository from '../interfaces/IEventRepository';
import BaseClass, {IBaseParams} from './baseClass';

/** Class to help interact with the underlying event system */
export default class EventHelper extends BaseClass {
  private _eventRepository;
  constructor(baseParams: IBaseParams, eventRepository: IEventRepository) {
    super(baseParams, 'EventHelper');
    this._eventRepository = eventRepository;
  }

  /**
   * Publishes an event to the underlying event system.
   * @param event the event to publish
   * @returns a boolean indicating if the publish was successful
   */
  async publishEvent(event: BaseEvent): Promise<boolean> {
    try {
      await this._eventRepository.publishEvent(event);
      return true;
    } catch (e) {
      this._logger.error(
        `Error publishing event: ${JSON.stringify(event)} ; error: ${e}`
      );
      return false;
    }
  }

  /**
   * Creates a queue that will listen for events with a particular pattern on a bus.
   * @param queueName the name of the queue to create
   * @param busName the name of the bus to listen to
   * @param topicPattern the pattern to listen for
   */
  async createQueue(queueName: string, busName: string, topicPattern: string) {
    await this._eventRepository.createQueue(queueName, busName, topicPattern);
  }

  /**
   * Will listen for messages in a queue and call the handlerFunc when new messages arrive.
   * @param queueName the name of the queue to listen to
   * @param handlerFunc The function that should be called when new messages arrive. The function should return true if the message is handled.
   */
  async listenForEvents(
    queueName: string,
    handlerFunc: (event: BaseEvent) => Promise<boolean>
  ) {
    await this._eventRepository.listenForEvents(queueName, handlerFunc);
  }

  /**
   * Gets an event from the queue if one exists.
   * This function assumes that the caller can handle the message and will remove the message from the queue after it is picked up.
   * @param queueName the name of the queue to get the message from
   * @returns an event if one exists, or null if one doesn't exist
   */
  async getEventFromQueue(queueName: string) {
    return await this._eventRepository.getEventFromQueue(queueName);
  }

  /**
   * Gets the approximate number of events in a queue.
   * @param queueName the name of the queue inspect
   * @returns the approximate number of events in the queue
   */
  async getNumEventsInQueue(queueName: string) {
    return await this._eventRepository.getNumEventsInQueue(queueName);
  }
}
