import { memo } from 'react';
import { FieldPath, FormProvider } from 'react-hook-form';
import NameAndDescriptionSection from './NameAndDescriptionSection';
import useConstructionHandoverForm from '@/forms/useConstructionHandoverForm';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import ScheduleSection from './ScheduleSection';
import ContactsSection from './ContactsSection';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, IconLink } from 'hds-react';
import { useAppDispatch } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { usePatchConstructionHandoverMutation } from '@/api/constructionHandoverApi';
import {
  IConstructionHandover,
  IConstructionHandoverRequest,
} from '@/interfaces/constructionHandoverInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';

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
    totalCost: null,
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
    if (data.id && project?.id) {
      const requestData = mapFormToRequest(data, project.id);
      patchConstructionHandover({ id: data.id, data: requestData });
    }
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(submitForm)}>
        <NameAndDescriptionSection />
        <ScheduleSection />
        <ContactsSection />

        <div className="project-form-banner">
          <div className="project-form-banner-container">
            <div className="flex gap-6">
              <Button variant={ButtonVariant.Secondary} type="submit">
                {t('constructionHandoverForm.saveDraft')}
              </Button>
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
