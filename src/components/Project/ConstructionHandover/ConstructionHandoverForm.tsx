import { memo } from 'react';
import { FieldPath, FormProvider } from 'react-hook-form';
import NameAndDescriptionSection from './NameAndDescriptionSection';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import ScheduleSection from './ScheduleSection';
import ContactsSection from './ContactsSection';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, IconLink } from 'hds-react';
import { useAppDispatch } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import {
  usePatchConstructionHandoverMutation,
  useTransitionConstructionHandoverStatusMutation,
} from '@/api/constructionHandoverApi';
import {
  ConstructionHandoverStatus,
  IConstructionHandover,
  IConstructionHandoverRequest,
} from '@/interfaces/constructionHandoverInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import FinancingSection from './FinancingSection/FinancingSection';
import useConstructionHandoverForm from '@/forms/useConstructionHandoverForm';

export function getFieldProps(name: FieldPath<IConstructionHandoverForm>) {
  return {
    name: name,
    label: `constructionHandoverForm.${name}`,
  };
}

function mapFormToRequest(
  formData: IConstructionHandoverForm,
  projectId: string,
): IConstructionHandoverRequest {
const parsedTotalCost = formData.totalCost === '' || formData.totalCost == null
    ? null
    : Number(formData.totalCost);

  return {
    name: formData.name,
    description: formData.description,
    constructionProcurementMethod: formData.constructionProcurementMethod.value,
    constructionStart: formData.constructionStart,
    constructionEnd: formData.constructionEnd,
    otherTimelineNotes: formData.otherTimelineNotes,
    personPlanning: formData.personPlanning.value,
    personFinancing: formData.personFinancing.value,
    project: projectId,
    totalCost: parsedTotalCost,
    linkDesignDrawings: null,
    linkCostAllocation: null,
    linkContractBoundaries: null,
    constructionProjectManager: null,
  };
}

interface IConstructionHandoverFormProps {
  constructionHandover: IConstructionHandover;
  project: IProject | null;
}

function ConstructionHandoverForm({
  constructionHandover,
  project,
}: Readonly<IConstructionHandoverFormProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formMethods = useConstructionHandoverForm(constructionHandover);
  const { handleSubmit } = formMethods;
  const [patchConstructionHandover] = usePatchConstructionHandoverMutation();
  const [doStatusTransition] = useTransitionConstructionHandoverStatusMutation();

  function onCopyLinkClick() {
    navigator.clipboard
      .writeText(globalThis.location.href)
      .then(() => {
        dispatch(
          notifySuccess({
            title: 'linkCopied',
            message: 'linkCopiedToClipboard',
            type: 'toast',
            duration: 3500,
          }),
        );
      })
      .catch(() => {
        dispatch(
          notifyError({
            title: 'undefined',
            message: 'linkCopyFailed',
            type: 'toast',
            duration: 3500,
          }),
        );
      });
  }

  function submitForm(data: IConstructionHandoverForm) {
    if (data.id && project?.id) {
      const requestData = mapFormToRequest(data, project.id);
      patchConstructionHandover({ id: data.id, data: requestData });
    }
  }

  function submitToProgrammer() {
    if (constructionHandover.id) {
      doStatusTransition({
        id: constructionHandover.id,
        to: ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER,
      });
    }
  }

  function submitToConstruction() {
    if (constructionHandover.id) {
      doStatusTransition({
        id: constructionHandover.id,
        to: ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
      });
    }
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(submitForm)}>
        <NameAndDescriptionSection />
        <ScheduleSection />
        <FinancingSection />
        <ContactsSection />

        <div className="project-form-banner">
          <div className="project-form-banner-container">
            <div className="flex gap-6">
              {constructionHandover.status === ConstructionHandoverStatus.DRAFT && (
                <Button type="button" onClick={submitToProgrammer}>
                  {t('constructionHandoverForm.submitToProgrammer')}
                </Button>
              )}
              {constructionHandover.status ===
                ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER && (
                <Button type="button" onClick={submitToConstruction}>
                  {t('constructionHandoverForm.submitToConstruction')}
                </Button>
              )}
              {constructionHandover.status === ConstructionHandoverStatus.DRAFT && (
                <Button variant={ButtonVariant.Secondary} type="submit">
                  {t('constructionHandoverForm.saveDraft')}
                </Button>
              )}
              <Button
                variant={ButtonVariant.Secondary}
                iconStart={<IconLink />}
                type="button"
                onClick={onCopyLinkClick}
              >
                {t('copyLink')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

export default memo(ConstructionHandoverForm);
