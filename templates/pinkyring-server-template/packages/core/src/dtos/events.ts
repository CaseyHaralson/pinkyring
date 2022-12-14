/** The event bus to listen to if you want to listen for events from the project */
export const EVENT_BUS_NAME = 'pinkyring-server-template';

/** Different events that can be emitted from the project */
export enum EventType {
  BLOG_POST_ADDED = 'blogpost.added',
}

/** An event object that can be placed on an event bus */
export interface BaseEvent {
  eventType: EventType;
  eventData: unknown;
}

export interface BlogPostAddedEvent extends BaseEvent {
  eventData: {
    authorId: string;
    blogPostId: string;
  };
}
