type EventMessage = {
  id: string;
  type: string;
  data: string;
};

let singleton: EventSourceMock;
let listeners: { [key: string]: any };
export default class EventSourceMock {
  constructor() {
    if (!singleton) {
      singleton = this;
      listeners = {};
    }
    return singleton;
  }

  addEventListener(name: string, callback: any) {
    listeners[name] = callback;
  }

  removeEventListener(name: string, callback: any) {
    delete listeners[name];
  }

  close() {}

  emitMessage(message: EventMessage) {
    const callback = listeners[message.type];
    callback(message);
  }

  onerror() {}

  onopen() {}
}

export const mockEventSource = () => {
  console.log('mocking event source');
  Object.defineProperty(window, 'EventSource', {
    value: EventSourceMock,
  });

  console.log('after event source mocked', window);
};
