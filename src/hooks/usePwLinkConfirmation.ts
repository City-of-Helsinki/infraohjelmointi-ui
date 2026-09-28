import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyGetPwProjectNameQuery } from '@/api/projectApi';
import { useAppDispatch } from '@/hooks/common';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { notifyError } from '@/reducers/notificationSlice';
import {
  ProjectPatchErrorMessageKey,
  getProjectPatchErrorMessage,
} from '@/utils/projectErrorMessage';

export type PwLinkConfirmationResult =
  | { status: 'confirmed' }
  | { status: 'cancelled' }
  | { status: 'failed'; message: ProjectPatchErrorMessageKey };

/**
 * An hkrId as the API stores it (a number), so "0123" and "123" compare equal.
 * Anything that is not a plain number is returned trimmed, for the API to reject.
 */
export const normalizeHkrId = (value: unknown): string => {
  const hkrId = String(value ?? '').trim();
  return /^\d+$/.test(hkrId) ? hkrId.replace(/^0+(?=\d)/, '') : hkrId;
};

/**
 * IO-935: before an hkrId (PW hanketunnus) is saved, look up the PW project it
 * points to and ask the user to confirm it. Every save of a programmed project
 * is synced to PW, so a mistyped hkrId would overwrite another PW project.
 *
 * Resolves to 'confirmed' when the user clicks OK (or PW sync is disabled, in
 * which case nothing is written to PW), 'cancelled' on Peruuta, and 'failed'
 * when the lookup fails; an error toast has then already been shown.
 *
 * `onDialogOpen` runs right before the dialog is shown, so the caller can take
 * down a loading overlay. Keep the overlay up during the lookup itself: it is
 * what stops a second save from starting meanwhile.
 */
const usePwLinkConfirmation = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isConfirmed } = useConfirmDialog();
  const [getPwProjectName] = useLazyGetPwProjectNameQuery();

  return useCallback(
    async (
      hkrId: string,
      { onDialogOpen }: { onDialogOpen?: () => void } = {},
    ): Promise<PwLinkConfirmationResult> => {
      let pwProject;
      try {
        pwProject = await getPwProjectName(hkrId).unwrap();
      } catch (error) {
        const message = getProjectPatchErrorMessage(error);
        dispatch(notifyError({ message, title: 'saveError', type: 'notification' }));
        return { status: 'failed', message };
      }

      if (!pwProject.syncEnabled) {
        return { status: 'confirmed' };
      }

      onDialogOpen?.();
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

      return confirmed ? { status: 'confirmed' } : { status: 'cancelled' };
    },
    [dispatch, getPwProjectName, isConfirmed, t],
  );
};

export default usePwLinkConfirmation;
