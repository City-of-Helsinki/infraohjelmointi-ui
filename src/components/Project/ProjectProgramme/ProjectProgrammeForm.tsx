import { Button, ButtonVariant, IconPen, StatusLabel } from 'hds-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormProvider } from 'react-hook-form';
import useProjectProgrammeForm from '@/forms/useProjectProgrammeForm';
import { usePatchProjectProgrammeSectionMutation } from '@/api/projectProgrammeApi';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { useAppDispatch } from '@/hooks/common';
import ProjectProgrammeBasicInfoForm from './ProjectProgrammeBasicInfoForm';
import {
  mapSectionIdToApiRoute,
  PROJECT_PROGRAMME_FORM_SECTION_CONFIG,
  ProjectProgrammeSectionId,
} from './projectProgrammeSections';
import {
  IProjectProgrammeForm,
  IProjectProgrammeFormProps,
} from '@/interfaces/projectProgrammeInterfaces';
import type { FieldNamesMarkedBoolean } from 'react-hook-form';
import DesignCriteriaForm from './DesignCriteriaForm';

type DirtyFields = FieldNamesMarkedBoolean<IProjectProgrammeForm>;

export function pickChangedFormFields(
  formData: IProjectProgrammeForm,
  activeSection: ProjectProgrammeSectionId,
  dirtyFields: Record<string, boolean> | undefined,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const config = PROJECT_PROGRAMME_FORM_SECTION_CONFIG[activeSection];

  for (const field of config.fields) {
    if (dirtyFields?.[field]) {
      const value = (formData[activeSection] as Record<string, unknown> | undefined)?.[field];

      payload[config.toApiField[field]] = value;
    }
  }

  return payload;
}

export function pickChangedLinks(
  formSection: ProjectProgrammeSectionId,
  formData: IProjectProgrammeForm,
  dirtyFields: DirtyFields[ProjectProgrammeSectionId] | undefined,
): string[] | undefined {
  if (!dirtyFields?.links) {
    return undefined;
  }

  return (
    formData[formSection]?.links?.map((link) => link.value.trim()).filter(Boolean) ?? undefined
  );
}

function ProjectProgrammeForm({
  projectProgrammeId,
  activeSection,
  effectiveProjectProgramme,
  briefProgramme,
  onClose,
}: Readonly<IProjectProgrammeFormProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formMethods = useProjectProgrammeForm(effectiveProjectProgramme);
  const {
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = formMethods;
  const [patchProjectProgrammeSection] = usePatchProjectProgrammeSectionMutation();

  async function submitDraft(
    data: IProjectProgrammeForm,
    activeSection: keyof IProjectProgrammeForm,
  ) {
    const requestData: Record<string, unknown> = pickChangedFormFields(
      data,
      activeSection,
      dirtyFields?.[activeSection] as Record<string, boolean> | undefined,
    );
    const linksPayload = pickChangedLinks(activeSection, data, dirtyFields?.[activeSection]);

    if (linksPayload !== undefined) {
      requestData.links = linksPayload;
    }

    if (!Object.keys(requestData).length) {
      onClose();
      return;
    }

    try {
      await patchProjectProgrammeSection({
        id: projectProgrammeId,
        section: mapSectionIdToApiRoute(activeSection),
        data: requestData,
      }).unwrap();
      dispatch(
        notifySuccess({
          title: 'saveSuccess',
          message: 'formSaveSuccess',
          type: 'toast',
        }),
      );
      onClose();
    } catch {
      dispatch(
        notifyError({
          title: 'saveError',
          message: 'formSaveError',
          type: 'toast',
        }),
      );
    }
  }

  function handleShowChangeHistory() {
    dispatch(
      notifySuccess({
        title: 'update',
        message: 'projectProgrammeChangeHistoryNotImplemented',
        type: 'toast',
      }),
    );
  }

  return (
    <FormProvider {...formMethods}>
      <form
        className="project-form mx-auto max-w-xl"
        onSubmit={handleSubmit((data) => submitDraft(data, activeSection))}
        noValidate
      >
        <div className="mb-4">
          <StatusLabel type="info" iconStart={<IconPen />}>
            {t('projectProgrammeForm.draftStatus')}
          </StatusLabel>
        </div>

        {activeSection === 'basicInfo' && (
          <ProjectProgrammeBasicInfoForm briefProgramme={briefProgramme} />
        )}

        {activeSection === 'designCriteria' && <DesignCriteriaForm />}

        <div className="project-form-banner">
          <div className="project-form-banner-container">
            <div className="project-programme-actions">
              <Button variant={ButtonVariant.Secondary} type="submit" disabled={!isDirty}>
                {t('projectProgrammeForm.saveDraft')}
              </Button>
              <Button
                variant={ButtonVariant.Secondary}
                type="button"
                onClick={handleShowChangeHistory}
              >
                {t('projectProgrammeForm.changeHistory')}
              </Button>
              <Button variant={ButtonVariant.Secondary} type="button" onClick={onClose}>
                {t('projectProgrammeForm.cancel')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

export default memo(ProjectProgrammeForm);
