import { Button, ButtonVariant, IconPen, StatusLabel } from 'hds-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormProvider } from 'react-hook-form';
import useProjectProgrammeForm from '@/forms/useProjectProgrammeForm';
import {
  usePatchProjectProgrammeSectionMutation,
  usePostProjectProgrammeSectionMutation,
} from '@/api/projectProgrammeApi';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { useAppDispatch } from '@/hooks/common';
import ProjectProgrammeBasicInfoForm from './BasicInfoSection';
import { mapSectionIdToApiRoute, ProjectProgrammeSectionId } from './projectProgrammeSections';
import {
  IProjectProgrammeForm,
  IProjectProgrammeFormProps,
} from '@/interfaces/projectProgrammeInterfaces';
import type { FieldNamesMarkedBoolean } from 'react-hook-form';
import DesignCriteriaForm from './DesignCriteriaSection';

type DirtyFields = FieldNamesMarkedBoolean<IProjectProgrammeForm>;

function normalizeTextValue(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export function pickChangedFormFields(
  formData: IProjectProgrammeForm,
  activeSection: ProjectProgrammeSectionId,
  dirtyFields: DirtyFields[ProjectProgrammeSectionId] | undefined,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const dirtyFieldNames = new Set(
    Object.entries(dirtyFields ?? {})
      .filter(([field, isDirty]) => field !== 'links' && isDirty === true)
      .map(([field]) => field),
  );

  for (const [field, value] of Object.entries(formData[activeSection] ?? {})) {
    if (dirtyFieldNames.has(field)) {
      payload[field] = normalizeTextValue(value);
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

  return formData[formSection]?.links?.map((link) => link.value.trim()).filter(Boolean) ?? [];
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
  const [postProjectProgrammeSection] = usePostProjectProgrammeSectionMutation();
  const [patchProjectProgrammeSection] = usePatchProjectProgrammeSectionMutation();

  async function submitDraft(
    data: IProjectProgrammeForm,
    activeSection: keyof IProjectProgrammeForm,
  ) {
    const requestData: Record<string, unknown> = pickChangedFormFields(
      data,
      activeSection,
      dirtyFields?.[activeSection],
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
      const request = {
        id: projectProgrammeId,
        section: mapSectionIdToApiRoute(activeSection),
        data: requestData,
      };

      if (effectiveProjectProgramme?.[activeSection]) {
        await patchProjectProgrammeSection(request).unwrap();
      } else {
        await postProjectProgrammeSection(request).unwrap();
      }
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
