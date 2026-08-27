import { IMyWorkloadEditFormValues } from '@/components/MyWorkload/Table/useMyWorkloadEditForm';
import {
  getMyWorkloadProjectRequestFields,
  myWorkloadValuesToProjectRequest,
} from '@/utils/myWorkloadProjectRequest';

const baseValues: IMyWorkloadEditFormValues = {
  planningStart: '01.01.2026',
  planningEnd: '31.12.2026',
  presenceStart: '01.02.2026',
  presenceEnd: '30.11.2026',
  visibilityStart: '01.03.2026',
  visibilityEnd: '31.10.2026',
  constructionStart: '01.04.2027',
  constructionEnd: '31.10.2027',
  planningCostForecast: '300',
  planningPhaseId: 'planning-phase-1',
  planningWorkQuantity: '150',
  constructionCostForecast: '500',
  constructionPhaseId: 'construction-phase-1',
  constructionWorkQuantity: '250',
  phaseId: 'phase-1',
  phaseDetailId: 'phase-detail-1',
};

describe('myWorkloadProjectRequest', () => {
  it.each([
    [true, 'planning view'],
    [false, 'construction view'],
  ])('does not create a request for unchanged fields in %s', (isPlanningView) => {
    expect(
      myWorkloadValuesToProjectRequest(
        baseValues,
        baseValues,
        getMyWorkloadProjectRequestFields(isPlanningView),
      ),
    ).toEqual({});
  });

  it.each([
    ['phaseId', 'phase', 'phase-2'],
    ['phaseDetailId', 'phaseDetail', 'phase-detail-2'],
    ['planningStart', 'estPlanningStart', '01.07.2026'],
    ['planningEnd', 'estPlanningEnd', '31.07.2026'],
    ['presenceStart', 'presenceStart', '01.08.2026'],
    ['presenceEnd', 'presenceEnd', '31.08.2026'],
    ['visibilityStart', 'visibilityStart', '01.09.2026'],
    ['visibilityEnd', 'visibilityEnd', '30.09.2026'],
    ['planningCostForecast', 'planningCostForecast', '301'],
    ['planningPhaseId', 'planningPhase', 'planning-phase-2'],
    ['planningWorkQuantity', 'planningWorkQuantity', '151'],
  ] as Array<[keyof IMyWorkloadEditFormValues, string, string]>)(
    'creates a planning request with only %s when only that field changed',
    (field, requestKey, value) => {
      expect(
        myWorkloadValuesToProjectRequest(
          { ...baseValues, [field]: value },
          baseValues,
          getMyWorkloadProjectRequestFields(true),
        ),
      ).toEqual({ [requestKey]: value });
    },
  );

  it.each([
    ['phaseId', 'phase', 'phase-2'],
    ['phaseDetailId', 'phaseDetail', 'phase-detail-2'],
    ['constructionStart', 'estConstructionStart', '01.05.2027'],
    ['constructionEnd', 'estConstructionEnd', '31.05.2027'],
    ['constructionCostForecast', 'constructionCostForecast', '501'],
    ['constructionPhaseId', 'constructionPhase', 'construction-phase-2'],
    ['constructionWorkQuantity', 'constructionWorkQuantity', '251'],
  ] as Array<[keyof IMyWorkloadEditFormValues, string, string]>)(
    'creates a construction request with only %s when only that field changed',
    (field, requestKey, value) => {
      expect(
        myWorkloadValuesToProjectRequest(
          { ...baseValues, [field]: value },
          baseValues,
          getMyWorkloadProjectRequestFields(false),
        ),
      ).toEqual({ [requestKey]: value });
    },
  );

  it.each([
    ['phaseDetailId', 'phaseDetail'],
    ['presenceStart', 'presenceStart'],
  ] as Array<[keyof IMyWorkloadEditFormValues, string]>)(
    'sends null for %s when that field is cleared',
    (field, requestKey) => {
      expect(
        myWorkloadValuesToProjectRequest(
          { ...baseValues, [field]: '' },
          baseValues,
          getMyWorkloadProjectRequestFields(true),
        ),
      ).toEqual({ [requestKey]: null });
    },
  );
});
