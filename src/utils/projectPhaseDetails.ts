import { IListItem, IOption } from '@/interfaces/common';
import { listItemToOption } from './common';

export const getProjectPhaseDetailOptions = (
  phaseDetails: IListItem[],
  phaseId: string,
): IOption[] =>
  phaseId
    ? phaseDetails
        .filter((detail) => detail.projectPhase?.id === phaseId)
        .map((detail) => listItemToOption(detail))
    : [];

export const phaseHasDetails = (phaseDetails: IListItem[], phaseId: string): boolean =>
  phaseDetails.some((detail) => detail.projectPhase?.id === phaseId);

export const phaseDetailBelongsToPhase = (
  phaseDetails: IListItem[],
  phaseDetailId: string,
  phaseId: string,
): boolean =>
  !phaseDetailId ||
  phaseDetails.some(
    (detail) => detail.id === phaseDetailId && detail.projectPhase?.id === phaseId,
  );