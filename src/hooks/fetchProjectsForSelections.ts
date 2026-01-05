import { MutableRefObject } from 'react';
import { PlanningMode, PlanningRowType } from '@/interfaces/planningInterfaces';
import { AppDispatch } from '@/store';
import { setProjects, setProjectsRequestId } from '@/reducers/planningSlice';
import { fetchProjectsByRelation } from '@/utils/planningRowUtils';
import { isRequestCanceled } from '@/utils/http';
import { createProjectsRequestId } from '@/utils/requestId';

interface FetchProjectsParams {
  id: string;
  mode: PlanningMode;
  type: PlanningRowType;
  forcedToFrame: boolean;
  startYear?: number | null;
  isCoordinator?: boolean;
  dispatch: AppDispatch;
  projectsFetchAbortController: MutableRefObject<AbortController | null>;
  errorContext: string;
}

export const fetchProjectsForSelections = async ({
  id,
  mode,
  type,
  forcedToFrame,
  startYear,
  isCoordinator,
  dispatch,
  projectsFetchAbortController,
  errorContext,
}: FetchProjectsParams) => {
  const year = startYear ?? new Date().getFullYear();

  projectsFetchAbortController.current?.abort();
  const abortController = new AbortController();
  projectsFetchAbortController.current = abortController;

  const requestId = createProjectsRequestId();
  dispatch(setProjectsRequestId({ mode, requestId }));

  try {
    const projects = await fetchProjectsByRelation(
      type,
      id,
      forcedToFrame,
      year,
      isCoordinator,
      abortController.signal,
    );
    dispatch(setProjects({ mode, projects, requestId }));
  } catch (e) {
    if (isRequestCanceled(e)) {
      return;
    }
    console.log(`Error fetching projects for ${errorContext}: `, e);
  } finally {
    if (projectsFetchAbortController.current === abortController) {
      projectsFetchAbortController.current = null;
    }
  }
};
