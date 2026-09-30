// IO-865: pick the toast for a patchProject failure. The API marks the
// "PW-hanketunnusta ei löydy" case with a 400 body of
// `{ hkrId: ["PW_PROJECT_NOT_FOUND"] }`; everything else falls through to
// the generic formSaveError. RTK baseQuery wraps the axios error so the
// response body lives at `error.data`, not `error.response.data`.
//
// We scan the hkrId array with .includes() rather than checking the first
// element, so that a future validator stacking another code onto the same
// field (e.g. ["SOME_OTHER", "PW_PROJECT_NOT_FOUND"]) does not silently
// fall through to the generic toast.
//
// IO-935 adds three more hkrId codes: PW_LINK_NOT_CONFIRMED (a save tried to
// set an hkrId without confirming the PW project), PW_UNAVAILABLE (the PW
// project lookup could not reach PW) and INVALID_HKR_ID (the lookup was given
// something that is not a valid hkrId).

export const PW_PROJECT_NOT_FOUND_CODE = 'PW_PROJECT_NOT_FOUND';
export const PW_LINK_NOT_CONFIRMED_CODE = 'PW_LINK_NOT_CONFIRMED';
export const PW_UNAVAILABLE_CODE = 'PW_UNAVAILABLE';
export const INVALID_HKR_ID_CODE = 'INVALID_HKR_ID';

export type PwErrorMessageKey =
  'pwProjectNotFound' | 'pwLinkNotConfirmed' | 'pwUnavailable' | 'pwInvalidHkrId';

export type ProjectPatchErrorMessageKey = PwErrorMessageKey | 'formSaveError';

const PW_ERROR_MESSAGES: Array<[string, PwErrorMessageKey]> = [
  [PW_PROJECT_NOT_FOUND_CODE, 'pwProjectNotFound'],
  [PW_LINK_NOT_CONFIRMED_CODE, 'pwLinkNotConfirmed'],
  [PW_UNAVAILABLE_CODE, 'pwUnavailable'],
  [INVALID_HKR_ID_CODE, 'pwInvalidHkrId'],
];

/** The message key for the PW error codes of an `hkrId` field error, or null if there is none. */
export const getPwErrorMessageForCodes = (codes: unknown): PwErrorMessageKey | null => {
  if (!Array.isArray(codes)) {
    return null;
  }
  const match = PW_ERROR_MESSAGES.find(([code]) => codes.includes(code));
  return match ? match[1] : null;
};

/** The message key for a PW error code carried on `hkrId`, or null if there is none. */
export const getPwErrorMessage = (error: unknown): PwErrorMessageKey | null => {
  if (error && typeof error === 'object') {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === 'object') {
      return getPwErrorMessageForCodes((data as { hkrId?: unknown }).hkrId);
    }
  }
  return null;
};

export const getProjectPatchErrorMessage = (error: unknown): ProjectPatchErrorMessageKey =>
  getPwErrorMessage(error) ?? 'formSaveError';
