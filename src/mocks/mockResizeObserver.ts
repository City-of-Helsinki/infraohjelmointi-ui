class ResizeObserverMock {
  observe() {
    // mock implementation
  }
  unobserve() {
    // mock implementation
  }
  disconnect() {
    // mock implementation
  }
}

export const mockResizeObserver = () => {
  Object.defineProperty(window, 'ResizeObserver', {
    value: ResizeObserverMock,
  });
}