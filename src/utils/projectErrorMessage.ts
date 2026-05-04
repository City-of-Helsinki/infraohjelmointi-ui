// IO-865: pick the toast for a patchProject failure. The API marks the
// "PW-hanketunnusta ei löydy" case with a 400 body of
// `{ hkrId: ["PW_PROJECT_NOT_FOUND"] }`; everything else falls through to
// the generic formSaveError. RTK baseQuery wraps the axios error so the
// response body lives at `error.data`, not `error.response.data`.

export const PW_PROJECT_NOT_FOUND_CODE = 'PW_PROJECT_NOT_FOUND';

export type ProjectPatchErrorMessageKey = 'pwProjectNotFound' | 'formSaveError';

export const getProjectPatchErrorMessage = (
  error: unknown,
): ProjectPatchErrorMessageKey => {
  if (error && typeof error === 'object') {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === 'object') {
      const hkrId = (data as { hkrId?: unknown }).hkrId;
      if (Array.isArray(hkrId) && hkrId[0] === PW_PROJECT_NOT_FOUND_CODE) {
        return 'pwProjectNotFound';
      }
    }
  }
  return 'formSaveError';
};
