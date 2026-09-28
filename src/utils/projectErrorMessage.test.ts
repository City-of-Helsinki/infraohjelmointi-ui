import {
  INVALID_HKR_ID_CODE,
  PW_LINK_NOT_CONFIRMED_CODE,
  PW_PROJECT_NOT_FOUND_CODE,
  PW_UNAVAILABLE_CODE,
  getProjectPatchErrorMessage,
  getPwErrorMessage,
  getPwErrorMessageForCodes,
} from './projectErrorMessage';

describe('getProjectPatchErrorMessage', () => {
  it('returns "pwProjectNotFound" when backend signals PW project not found', () => {
    const error = {
      status: 400,
      data: { hkrId: [PW_PROJECT_NOT_FOUND_CODE] },
    };
    expect(getProjectPatchErrorMessage(error)).toBe('pwProjectNotFound');
  });

  it('returns "formSaveError" for the legacy generic sync failure body', () => {
    const error = {
      status: 400,
      data: {
        hkrId:
          "Project updated successfully but failed to sync to ProjectWise: timeout. Please use 'Update to PW' button to retry.",
      },
    };
    expect(getProjectPatchErrorMessage(error)).toBe('formSaveError');
  });

  it('returns "formSaveError" for unrelated 400 validation errors', () => {
    const error = {
      status: 400,
      data: { phase: ['planningStartYear and constructionEndYear must be populated'] },
    };
    expect(getProjectPatchErrorMessage(error)).toBe('formSaveError');
  });

  it('returns "formSaveError" for non-axios errors and missing data', () => {
    expect(getProjectPatchErrorMessage(undefined)).toBe('formSaveError');
    expect(getProjectPatchErrorMessage(null)).toBe('formSaveError');
    expect(getProjectPatchErrorMessage('boom')).toBe('formSaveError');
    expect(getProjectPatchErrorMessage(new Error('boom'))).toBe('formSaveError');
    expect(getProjectPatchErrorMessage({ status: 500 })).toBe('formSaveError');
  });

  it('does not match when hkrId is a bare string (API always sends a list)', () => {
    const error = { data: { hkrId: PW_PROJECT_NOT_FOUND_CODE } };
    expect(getProjectPatchErrorMessage(error)).toBe('formSaveError');
  });

  it('matches when the flattened error keeps the backend payload under data', () => {
    const error = {
      status: 400,
      data: {
        status: 400,
        hkrId: ['SOME_OTHER_CODE', PW_PROJECT_NOT_FOUND_CODE],
        message: 'Request failed with status code 400',
      },
    };

    expect(getProjectPatchErrorMessage(error)).toBe('pwProjectNotFound');
  });

  it('matches when the PW code is present but not first in the array', () => {
    const error = {
      status: 400,
      data: { hkrId: ['SOME_OTHER_CODE', PW_PROJECT_NOT_FOUND_CODE] },
      message: 'Request failed with status code 400',
    };

    expect(getProjectPatchErrorMessage(error)).toBe('pwProjectNotFound');
  });
});

describe('IO-935 PW error codes', () => {
  it.each([
    [PW_LINK_NOT_CONFIRMED_CODE, 'pwLinkNotConfirmed'],
    [PW_UNAVAILABLE_CODE, 'pwUnavailable'],
    [INVALID_HKR_ID_CODE, 'pwInvalidHkrId'],
  ])('maps %s to "%s"', (code, expected) => {
    expect(getProjectPatchErrorMessage({ status: 400, data: { hkrId: [code] } })).toBe(expected);
    expect(getPwErrorMessage({ status: 400, data: { hkrId: [code] } })).toBe(expected);
  });

  it('getPwErrorMessage returns null for a non-PW error', () => {
    expect(getPwErrorMessage({ status: 400, data: { name: ['required'] } })).toBeNull();
    expect(getPwErrorMessage({ status: 400, data: { hkrId: ['something else'] } })).toBeNull();
    expect(getPwErrorMessage(undefined)).toBeNull();
  });

  it('getPwErrorMessageForCodes reads a bare field error array', () => {
    expect(getPwErrorMessageForCodes([PW_PROJECT_NOT_FOUND_CODE])).toBe('pwProjectNotFound');
    expect(getPwErrorMessageForCodes(PW_PROJECT_NOT_FOUND_CODE)).toBeNull();
    expect(getPwErrorMessageForCodes(['Ensure this field has no more than 5 digits.'])).toBeNull();
  });
});
