import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyGetPwProjectNameQuery } from '@/api/projectApi';
import { useAppDispatch } from '@/hooks/common';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { notifyError } from '@/reducers/notificationSlice';
import { getProjectPatchErrorMessage } from '@/utils/projectErrorMessage';

export type PwLinkConfirmationResult = 'confirmed' | 'cancelled' | 'failed';

/**
 * IO-935: before an hkrId (PW hanketunnus) is saved, look up the PW project it
 * points to and ask the user to confirm it. Every save of a programmed project
 * is synced to PW, so a mistyped hkrId would overwrite another PW project.
 *
 * Resolves to 'confirmed' when the user clicks OK (or PW sync is disabled, in
 * which case nothing is written to PW), 'cancelled' on Peruuta, and 'failed'
 * when the lookup fails; an error toast has then already been shown.
 */
const usePwLinkConfirmation = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isConfirmed } = useConfirmDialog();
  const [getPwProjectName] = useLazyGetPwProjectNameQuery();

  return useCallback(
    async (hkrId: string): Promise<PwLinkConfirmationResult> => {
      let pwProject;
      try {
        pwProject = await getPwProjectName(hkrId).unwrap();
      } catch (error) {
        dispatch(
          notifyError({
            message: getProjectPatchErrorMessage(error),
            title: 'saveError',
            type: 'notification',
          }),
        );
        return 'failed';
      }

      if (!pwProject.syncEnabled) {
        return 'confirmed';
      }

      const confirmed = await isConfirmed({
        title: t('projectForm.pwLinkDialog.title'),
        description: t('projectForm.pwLinkDialog.description', {
          name: pwProject.name || t('projectForm.pwLinkDialog.nameMissing'),
          hkrId: pwProject.hkrId,
          // Rendered as plain text by React, which escapes it already
          interpolation: { escapeValue: false },
        }),
        confirmButtonText: 'ok',
      });

      return confirmed ? 'confirmed' : 'cancelled';
    },
    [dispatch, getPwProjectName, isConfirmed, t],
  );
};

export default usePwLinkConfirmation;
