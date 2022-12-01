import {IBaseServiceParams} from '@pinkyring-server-template/core/services/baseService';
import Logger from '@pinkyring-server-template/core/util/logger';
import EventHelper from '@pinkyring-server-template/core/util/eventHelper';
import {mock, mockReset} from 'jest-mock-extended';
import ConfigHelper from '@pinkyring-server-template/core/util/configHelper';
import IEventRepository from '@pinkyring-server-template/core/interfaces/IEventRepository';
import {BaseEvent} from '@pinkyring-server-template/core/dtos/events';

describe('event helper unit tests', () => {
  const baseParams = mock<IBaseServiceParams>();
  baseParams.logger = mock<Logger>();
  baseParams.configHelper = mock<ConfigHelper>();
  const eventRepo = mock<IEventRepository>();
  const eventHelper = new EventHelper(baseParams, eventRepo);

  beforeEach(() => {
    mockReset(eventRepo);
  });

  describe('publish event function', () => {
    test('should call repository', async () => {
      const event = {} as BaseEvent;
      await eventHelper.publishEvent(event);

      expect(eventRepo.publishEvent).toBeCalledTimes(1);
      expect(eventRepo.publishEvent).toBeCalledWith(event);
    });

    test('should return true on success', async () => {
      const event = {} as BaseEvent;
      const result = await eventHelper.publishEvent(event);

      expect(result).toBe(true);
    });

    test('should return false on failure', async () => {
      eventRepo.publishEvent.mockImplementation(() => {
        throw new Error('some error');
      });

      const event = {} as BaseEvent;
      const result = await eventHelper.publishEvent(event);

      expect(result).toBe(false);
    });
  });

  describe('create queue function', () => {
    test('should call repository', async () => {
      const queueName = 'newqueue';
      const busName = 'somebus';
      const topicPattern = 'cooltopic';
      await eventHelper.createQueue(queueName, busName, topicPattern);

      expect(eventRepo.createQueue).toBeCalledTimes(1);
      expect(eventRepo.createQueue).toBeCalledWith(
        queueName,
        busName,
        topicPattern
      );
    });
  });

  describe('listen for events function', () => {
    test('should call repository', async () => {
      const queueName = 'newqueue';
      const handlerFunc = () => {
        return Promise.resolve(true);
      };
      await eventHelper.listenForEvents(queueName, handlerFunc);

      expect(eventRepo.listenForEvents).toBeCalledTimes(1);
      expect(eventRepo.listenForEvents).toBeCalledWith(queueName, handlerFunc);
    });
  });

  describe('get event from queue function', () => {
    test('should call repository', async () => {
      const queueName = 'newqueue';
      await eventHelper.getEventFromQueue(queueName);

      expect(eventRepo.getEventFromQueue).toBeCalledTimes(1);
      expect(eventRepo.getEventFromQueue).toBeCalledWith(queueName);
    });

    test('should return value from repo', async () => {
      const event = {} as BaseEvent;
      eventRepo.getEventFromQueue.mockImplementation(() => {
        return Promise.resolve(event);
      });

      const queueName = 'newqueue';
      const result = await eventHelper.getEventFromQueue(queueName);

      expect(result).toBe(event);
    });
  });

  describe('get num events in queue function', () => {
    test('should call repository', async () => {
      const queueName = 'newqueue';
      await eventHelper.getNumEventsInQueue(queueName);

      expect(eventRepo.getNumEventsInQueue).toBeCalledTimes(1);
      expect(eventRepo.getNumEventsInQueue).toBeCalledWith(queueName);
    });

    test('should return value from repo', async () => {
      eventRepo.getNumEventsInQueue.mockImplementation(() => {
        return Promise.resolve(5);
      });

      const queueName = 'newqueue';
      const result = await eventHelper.getNumEventsInQueue(queueName);

      expect(result).toBe(5);
    });
  });
});
