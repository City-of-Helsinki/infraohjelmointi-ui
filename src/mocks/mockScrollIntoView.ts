// jsdom does not implement scrollIntoView, which otherwise logs a "Not implemented" error
// whenever code (e.g. scrollToFirstField) calls it during tests.
export const mockScrollIntoView = () => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
};
