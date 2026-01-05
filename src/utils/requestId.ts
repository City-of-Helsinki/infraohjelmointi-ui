export const createProjectsRequestId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
