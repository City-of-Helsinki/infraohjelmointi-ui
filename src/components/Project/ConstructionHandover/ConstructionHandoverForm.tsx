import { memo } from 'react';
import { FieldPath, FormProvider } from 'react-hook-form';
import NameAndDescriptionSection from './NameAndDescriptionSection';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import ScheduleSection from './ScheduleSection';
import ContactsSection from './ContactsSection';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonVariant,
  IconLink,
  Notification,
  NotificationSize,
  Tooltip,
} from 'hds-react';
import { useAppDispatch } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import {
  usePatchConstructionHandoverMutation,
  useTransitionConstructionHandoverStatusMutation,
} from '@/api/constructionHandoverApi';
import { IProject } from '@/interfaces/projectInterfaces';
import {
  ConstructionHandoverStatus,
  IConstructionHandover,
  IConstructionHandoverRequest,
} from '@/interfaces/constructionHandoverInterfaces';
import FinancingSection from './FinancingSection/FinancingSection';
import useConstructionHandoverForm from '@/forms/useConstructionHandoverForm';
import { parseCurrency } from '@/utils/currencyUtils';
import { isConstructionHandoverLocked } from './constructionHandoverUtils';
import useConstructionHandoverPermissions from './useConstructionHandoverPermissions';

export function getFieldProps(name: FieldPath<IConstructionHandoverForm>) {
  return {
    name: name,
    label: `constructionHandoverForm.${name}`,
  };
}

function mapFormToRequest(formData: IConstructionHandoverForm): IConstructionHandoverRequest {
  const parsedTotalCost = parseCurrency(formData.totalCost);

  return {
    name: formData.name,
    description: formData.description,
    constructionProcurementMethod: formData.constructionProcurementMethod.value,
    staraProcurementReason: formData.staraProcurementReason?.value ?? null,
    constructionStart: formData.constructionStart,
    constructionEnd: formData.constructionEnd,
    otherTimelineNotes: formData.otherTimelineNotes,
    personPlanning: formData.personPlanning.value,
    personFinancing: formData.personFinancing.value,
    totalCost: parsedTotalCost,
    linkDesignDrawings: null,
    linkCostAllocation: null,
    linkContractBoundaries: null,
  };
}

interface IConstructionHandoverFormProps {
  constructionHandover: IConstructionHandover;
  project?: IProject;
}

function ConstructionHandoverForm({
  constructionHandover,
  project,
}: Readonly<IConstructionHandoverFormProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formMethods = useConstructionHandoverForm(constructionHandover);
  const {
    handleSubmit,
    formState: { isDirty },
  } = formMethods;
  const [patchConstructionHandover] = usePatchConstructionHandoverMutation();
  const [doStatusTransition] = useTransitionConstructionHandoverStatusMutation();

  const {
    isProjectManager,
    isPlanner,
    isConstructionManagementLead,
    isResponsiblePersonForProject,
  } = useConstructionHandoverPermissions(project);

  const showSubmitToProgrammerButton =
    constructionHandover.status === ConstructionHandoverStatus.DRAFT &&
    isProjectManager &&
    isResponsiblePersonForProject;
  const showSubmitToConstructionButton =
    constructionHandover.status === ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER && isPlanner;
  const showSaveDraftButton = !isConstructionHandoverLocked(constructionHandover);
  const showReturnToDraftButton = [
    ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
    ConstructionHandoverStatus.PROJECT_MANAGER_NAMED,
    ConstructionHandoverStatus.MOVED_TO_CONSTRUCTION_PREPARATION,
  ].includes(constructionHandover.status);
  const showNameProjectManagerNotification =
    constructionHandover.status === ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION &&
    isConstructionManagementLead;
  const showSubmitTooltip = showSubmitToProgrammerButton || showSubmitToConstructionButton;

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

  async function submitForm(data: IConstructionHandoverForm) {
    if (data.id) {
      try {
        const requestData = mapFormToRequest(data);
        await patchConstructionHandover({ id: data.id, data: requestData }).unwrap();
      } catch (error) {
        return error;
      }
    }
  }

  async function submitFormBeforeStatusTransition(data: IConstructionHandoverForm) {
    if (isDirty) {
      // If there are unsaved changes, save them before doing the status transition
      const error = await submitForm(data);
      if (error) {
        return error;
      }
    }
  }

  async function submitToProgrammer() {
    const error = await submitFormBeforeStatusTransition(formMethods.getValues());
    if (error) {
      return;
    }

    doStatusTransition({
      id: constructionHandover.id,
      to: ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER,
    });
  }

  async function submitToConstruction() {
    const error = await submitFormBeforeStatusTransition(formMethods.getValues());
    if (error) {
      return;
    }

    doStatusTransition({
      id: constructionHandover.id,
      to: ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
    });
  }

  function returnToDraft() {
    doStatusTransition({
      id: constructionHandover.id,
      to: ConstructionHandoverStatus.DRAFT,
    });
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(submitForm)}>
        <NameAndDescriptionSection
          shouldShowProcurementMethod={[
            ConstructionHandoverStatus.DRAFT,
            ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER,
            ConstructionHandoverStatus.MOVED_TO_CONSTRUCTION_PREPARATION,
          ].includes(constructionHandover.status)}
        />
        <ScheduleSection />
        <FinancingSection constructionHandover={constructionHandover} />
        <ContactsSection />

        <div className="project-form-banner">
          <div className="project-form-banner-container">
            <div className="flex items-center gap-6">
              {showSubmitTooltip && (
                <Tooltip>{t('constructionHandoverForm.submitTooltip')}</Tooltip>
              )}
              {showSubmitToProgrammerButton && (
                <Button type="button" onClick={handleSubmit(submitToProgrammer)}>
                  {t('constructionHandoverForm.submitToProgrammer')}
                </Button>
              )}
              {showSubmitToConstructionButton && (
                <Button type="button" onClick={handleSubmit(submitToConstruction)}>
                  {t('constructionHandoverForm.submitToConstruction')}
                </Button>
              )}
              {showSaveDraftButton && (
                <Button variant={ButtonVariant.Secondary} type="submit">
                  {t('constructionHandoverForm.saveDraft')}
                </Button>
              )}
              {showReturnToDraftButton && (
                <Button variant={ButtonVariant.Secondary} type="button" onClick={returnToDraft}>
                  {t('constructionHandoverForm.returnToDraft')}
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
              {showNameProjectManagerNotification && (
                <div>
                  <Notification
                    label={t('constructionHandoverForm.nameProjectManagerNotification')}
                    type="error"
                    size={NotificationSize.Small}
                  >
                    {t('constructionHandoverForm.nameProjectManagerNotification')}
                  </Notification>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

export default memo(ConstructionHandoverForm);
