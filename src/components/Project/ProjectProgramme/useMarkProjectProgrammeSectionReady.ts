import { useTransitionProjectProgrammeSectionStatusMutation } from '@/api/projectProgrammeApi';
import { useAppDispatch } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import {
  mapSectionIdToApiRoute,
  ProjectProgrammeSectionId,
} from './sections/projectProgrammeSections';

export default function useMarkProjectProgrammeSectionReady(
  projectProgrammeId: string | undefined,
  sectionId: ProjectProgrammeSectionId,
  programmeIsComplete: boolean,
) {
  const dispatch = useAppDispatch();
  const [transitionSectionStatus] = useTransitionProjectProgrammeSectionStatusMutation();

  return async (saveSection?: () => Promise<unknown>, onSuccess?: () => void) => {
    if (programmeIsComplete || !projectProgrammeId) return;

    try {
      await saveSection?.();
      await transitionSectionStatus({
        id: projectProgrammeId,
        section: mapSectionIdToApiRoute(sectionId),
        to: 'COMPLETE',
      }).unwrap();
      dispatch(
        notifySuccess({
          title: 'saveSuccess',
          message: 'projectProgrammeSectionMarkReadySuccess',
          type: 'toast',
        }),
      );
      onSuccess?.();
    } catch {
      dispatch(
        notifyError({
          title: 'saveError',
          message: 'projectProgrammeSectionMarkReadyError',
          type: 'toast',
        }),
      );
    }
  };
}
