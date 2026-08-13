import {
  PW_PROJECT_NOT_FOUND_CODE,
  getProjectPatchErrorMessage,
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
          'Project updated successfully but failed to sync to ProjectWise: timeout. Please use \'Update to PW\' button to retry.',
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
