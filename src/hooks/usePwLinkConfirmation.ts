import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyGetPwProjectNameQuery } from '@/api/projectApi';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { PwErrorMessageKey, getPwErrorMessage } from '@/utils/projectErrorMessage';

/** Why the PW project could not be checked: a PW code, or a failure outside PW. */
export type PwLinkFailureMessageKey = PwErrorMessageKey | 'pwLinkCheckFailed';

export type PwLinkConfirmationResult =
  | { status: 'confirmed' }
  | { status: 'cancelled' }
  | { status: 'failed'; message: PwLinkFailureMessageKey };

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
 * with the reason's message key when the lookup fails. The caller tells the
 * user, since only it knows what else was saved.
 *
 * `onDialogOpen` runs right before the dialog is shown, so the caller can take
 * down a loading overlay. Keep the overlay up during the lookup itself: it is
 * what stops a second save from starting meanwhile.
 */
const usePwLinkConfirmation = () => {
  const { t } = useTranslation();
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
        return { status: 'failed', message: getPwErrorMessage(error) ?? 'pwLinkCheckFailed' };
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
    [getPwProjectName, isConfirmed, t],
  );
};

export default usePwLinkConfirmation;
