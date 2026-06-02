import { memo } from 'react';
import { FieldPath, FormProvider } from 'react-hook-form';
import NameAndDescriptionSection from './NameAndDescriptionSection';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import ScheduleSection from './ScheduleSection';
import ContactsSection from './ContactsSection';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, IconLink, Notification, NotificationSize } from 'hds-react';
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
import FinancingSection from './FinancingSection/FinancingSection';
import useConstructionHandoverForm from '@/forms/useConstructionHandoverForm';
import { parseCurrency } from '@/utils/constructionHandoverUtils';

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
}

function ConstructionHandoverForm({
  constructionHandover,
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
      const requestData = mapFormToRequest(data);
      await patchConstructionHandover({ id: data.id, data: requestData });
    }
  }

  async function submitToProgrammer() {
    if (isDirty) {
      // If there are unsaved changes, save them before submitting to programmer
      await submitForm(formMethods.getValues());
    }

    doStatusTransition({
      id: constructionHandover.id,
      to: ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER,
    });
  }

  function submitToConstruction() {
    doStatusTransition({
      id: constructionHandover.id,
      to: ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
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
        <FinancingSection />
        <ContactsSection />

        <div className="project-form-banner">
          <div className="project-form-banner-container">
            <div className="flex items-center gap-6">
              {constructionHandover.status === ConstructionHandoverStatus.DRAFT && (
                <Button type="button" onClick={handleSubmit(submitToProgrammer)}>
                  {t('constructionHandoverForm.submitToProgrammer')}
                </Button>
              )}
              {constructionHandover.status ===
                ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER && (
                <Button type="button" onClick={handleSubmit(submitToConstruction)}>
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
              {constructionHandover.status ===
                ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION && (
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
