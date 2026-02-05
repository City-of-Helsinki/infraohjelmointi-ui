type EventMessage = {
  id: string;
  type: string;
  data: string;
};

let singleton: EventSourceMock;
type ListenerMap = {
  [eventName: string]: Array<(message: EventMessage) => void>;
};

let listeners: ListenerMap;

export default class EventSourceMock {
  constructor() {
    if (!singleton) {
      singleton = this;
      listeners = {};
    }
    return singleton;
  }

  addEventListener(name: string, callback: (message: EventMessage) => void) {
    if (!listeners[name]) {
      listeners[name] = [];
    }
    listeners[name].push(callback);
  }

  removeEventListener(name: string, callback: (message: EventMessage) => void) {
    if (!listeners[name]) {
      return;
    }
    listeners[name] = listeners[name].filter((listener) => listener !== callback);
    if (!listeners[name].length) {
      delete listeners[name];
    }
  }

  close() {}

  emitMessage(message: EventMessage) {
    const callbacks = listeners[message.type] ?? [];
    callbacks.forEach((callback) => callback(message));
  }

  onerror() {}

  onopen() {}
}

export const mockEventSource = () => {
  Object.defineProperty(window, 'EventSource', {
    value: EventSourceMock,
  });
};
