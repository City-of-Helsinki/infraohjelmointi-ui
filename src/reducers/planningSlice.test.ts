import planningReducer, { setProjects, setProjectsRequestId } from './planningSlice';
import { IProject } from '@/interfaces/projectInterfaces';

describe('planningSlice request id guard', () => {
  const createState = () => planningReducer(undefined, { type: 'init' });

  it('applies project updates when the request id matches the latest one for the mode', () => {
    const initial = createState();
    const state = {
      ...initial,
      mode: 'planning' as const,
      projectsRequestId: { ...initial.projectsRequestId, planning: 'req-123' },
      projects: [{ id: 'old-project' } as IProject],
    };
    const updatedProjects = [{ id: 'new-project' } as IProject];

    const nextState = planningReducer(
      state,
      setProjects({
        mode: 'planning',
        projects: updatedProjects,
        requestId: 'req-123',
      }),
    );

    expect(nextState.projects).toEqual(updatedProjects);
  });

  it('ignores out-of-date project responses whose request id no longer matches the latest request for the mode', () => {
    const initial = createState();
    const state = {
      ...initial,
      mode: 'planning' as const,
      projectsRequestId: { ...initial.projectsRequestId, planning: 'req-current' },
      projects: [{ id: 'existing-project' } as IProject],
    };
    const staleProjects = [{ id: 'stale-project' } as IProject];

    const nextState = planningReducer(
      state,
      setProjects({
        mode: 'planning',
        projects: staleProjects,
        requestId: 'req-old',
      }),
    );

    expect(nextState.projects).toEqual(state.projects);
  });

  it('tracks the latest request id per mode via setProjectsRequestId', () => {
    const initial = createState();

    const nextState = planningReducer(
      initial,
      setProjectsRequestId({ mode: 'coordination', requestId: 'coord-req' }),
    );

    expect(nextState.projectsRequestId.coordination).toBe('coord-req');
  });
});
