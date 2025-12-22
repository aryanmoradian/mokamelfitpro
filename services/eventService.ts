
import { UserEvent, EventType } from '../types';

const EVENTS_KEY = 'fitpro_events';

export const logUserEvent = (
  userId: string,
  eventType: EventType,
  source: UserEvent['source'],
  metadata: any = {}
) => {
  const events = getEvents();
  const newEvent: UserEvent = {
    id: crypto.randomUUID(),
    userId,
    eventType,
    source,
    metadata,
    createdAt: Date.now(),
  };
  
  const updatedEvents = [newEvent, ...events];
  localStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents.slice(0, 500))); // Keep last 500
  
  console.log(`[EVENT LOGGED]: ${eventType}`, newEvent);
  return newEvent;
};

export const getEvents = (): UserEvent[] => {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getUserEvents = (userId: string): UserEvent[] => {
  return getEvents().filter(e => e.userId === userId);
};
