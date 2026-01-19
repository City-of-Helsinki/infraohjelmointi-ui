export const createProjectsRequestId = () => {
  const array = new Uint32Array(1);
  globalThis.crypto.getRandomValues(array);
  return `${Date.now()}-${array[0].toString(36).slice(2, 11)}`;
};
