import { Button, ButtonVariant, IconCheckCircle, IconPen, StatusLabel } from 'hds-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormProvider } from 'react-hook-form';
import useProjectProgrammeForm from '@/forms/useProjectProgrammeForm';
import {
  useDeleteProjectProgrammeAttachmentMutation,
  usePatchProjectProgrammeSectionMutation,
  usePostProjectProgrammeAttachmentsMutation,
  usePostProjectProgrammeSectionMutation,
} from '@/api/projectProgrammeApi';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { useAppDispatch } from '@/hooks/common';
import ProjectProgrammeBasicInfoForm from './sections/BasicInfoSection';
import {
  mapSectionIdToApiRoute,
  ProjectProgrammeSectionId,
} from './sections/projectProgrammeSections';
import {
  IProjectProgrammeForm,
  IProjectProgrammeFormProps,
  IProjectProgrammeOtherAttachments,
} from '@/interfaces/projectProgrammeInterfaces';
import type { FieldNamesMarkedBoolean } from 'react-hook-form';
import DesignCriteriaSection from './sections/DesignCriteriaSection';
import TrafficPlanningCriteriaSection from './sections/TrafficPlanningCriteriaSection';
import UrbanSpacingPlanningCriteriaSection from './sections/UrbanSpacingPlanningCriteriaSection';
import MaintenanceNeedsSection from './sections/MaintenanceNeedsSection';
import InteractionAndRelatedProjectsSection from './sections/InteractionAndRelatedProjectsSection';
import OtherAttachmentsSection from './sections/OtherAttachmentsSection';
import useMarkProjectProgrammeSectionReady from './useMarkProjectProgrammeSectionReady';

type DirtyFields = FieldNamesMarkedBoolean<IProjectProgrammeForm>;

// Fields that are not sent in the section payload
const NON_PAYLOAD_FIELDS = new Set(['links', 'attachments', 'newFiles', 'removedAttachmentIds']);

function getErrorDetail(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('data' in error)) {
    return undefined;
  }
  const { data } = error as { data?: unknown };
  if (typeof data === 'object' && data !== null && 'detail' in data) {
    const { detail } = data as { detail?: unknown };
    return typeof detail === 'string' ? detail : undefined;
  }
  return undefined;
}

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
      .filter(([field, isDirty]) => !NON_PAYLOAD_FIELDS.has(field) && isDirty === true)
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
  isProjectProgrammeComplete,
  onClose,
  project,
}: Readonly<IProjectProgrammeFormProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formMethods = useProjectProgrammeForm(effectiveProjectProgramme, project);
  const {
    handleSubmit,
    getValues,
    formState: { isDirty, dirtyFields },
  } = formMethods;
  const [postProjectProgrammeSection] = usePostProjectProgrammeSectionMutation();
  const [patchProjectProgrammeSection] = usePatchProjectProgrammeSectionMutation();
  const [postProjectProgrammeAttachments] = usePostProjectProgrammeAttachmentsMutation();
  const [deleteProjectProgrammeAttachment] = useDeleteProjectProgrammeAttachmentMutation();
  const [attachmentSaveError, setAttachmentSaveError] = useState<string | null>(null);
  const markSectionReady = useMarkProjectProgrammeSectionReady(
    projectProgrammeId,
    activeSection,
    isProjectProgrammeComplete,
  );
  const activeSectionStatus = effectiveProjectProgramme?.[activeSection]?.status ?? 'DRAFT';
  const isActiveSectionComplete = activeSectionStatus === 'COMPLETE';
  const isFormReadOnly = isProjectProgrammeComplete || isActiveSectionComplete;

  async function saveAttachmentChanges(newFiles: File[], removedAttachmentIds: string[]) {
    setAttachmentSaveError(null);

    try {
      await Promise.all(
        removedAttachmentIds.map((attachmentId) =>
          deleteProjectProgrammeAttachment({ id: projectProgrammeId, attachmentId }).unwrap(),
        ),
      );

      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('file', file));
        await postProjectProgrammeAttachments({ id: projectProgrammeId, formData }).unwrap();
      }
    } catch (error) {
      setAttachmentSaveError(
        getErrorDetail(error) ?? t('projectProgrammeForm.otherAttachmentsSaveError'),
      );
      throw error;
    }
  }

  async function persistSection(
    data: IProjectProgrammeForm,
    activeSection: keyof IProjectProgrammeForm,
    createIfMissing = false,
  ): Promise<boolean> {
    const requestData: Record<string, unknown> = pickChangedFormFields(
      data,
      activeSection,
      dirtyFields?.[activeSection],
    );
    const linksPayload = pickChangedLinks(activeSection, data, dirtyFields?.[activeSection]);

    if (linksPayload !== undefined) {
      requestData.links = linksPayload;
    }

    const attachmentChanges: IProjectProgrammeOtherAttachments =
      activeSection === 'otherAttachments' ? (data.otherAttachments ?? {}) : {};
    const { newFiles = [], removedAttachmentIds = [] } = attachmentChanges;
    const hasAttachmentChanges = newFiles.length > 0 || removedAttachmentIds.length > 0;
    const hasSectionChanges = Object.keys(requestData).length > 0;

    const sectionExists = Boolean(effectiveProjectProgramme?.[activeSection]);
    if (!hasSectionChanges && !hasAttachmentChanges && (sectionExists || !createIfMissing)) {
      return false;
    }

    const request = {
      id: projectProgrammeId,
      section: mapSectionIdToApiRoute(activeSection),
      data: requestData,
    };

    if (sectionExists && hasSectionChanges) {
      await patchProjectProgrammeSection(request).unwrap();
    } else if (!sectionExists) {
      await postProjectProgrammeSection(request).unwrap();
    }

    if (hasAttachmentChanges) {
      await saveAttachmentChanges(newFiles, removedAttachmentIds);
    }

    return true;
  }

  async function submitDraft(
    data: IProjectProgrammeForm,
    activeSection: keyof IProjectProgrammeForm,
  ) {
    if (isProjectProgrammeComplete) return;

    try {
      const sectionWasSaved = await persistSection(data, activeSection);
      if (!sectionWasSaved) {
        onClose();
        return;
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

  function handleMarkSectionReady(data: IProjectProgrammeForm) {
    return markSectionReady(() => persistSection(data, activeSection, true), onClose);
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
        className="project-form mx-auto max-w-2xl"
        onSubmit={handleSubmit((data) => submitDraft(data, activeSection))}
        noValidate
      >
        <div className="mb-4">
          <StatusLabel
            type={isActiveSectionComplete ? 'success' : 'info'}
            iconStart={isActiveSectionComplete ? <IconCheckCircle /> : <IconPen />}
          >
            {t(
              isActiveSectionComplete
                ? 'projectProgrammeForm.completeStatus'
                : 'projectProgrammeForm.draftStatus',
            )}
          </StatusLabel>
        </div>

        <fieldset disabled={isFormReadOnly} className="m-0 min-w-0 border-0 p-0">
          {activeSection === 'basicInfo' && (
            <ProjectProgrammeBasicInfoForm briefProgramme={briefProgramme} />
          )}
          {activeSection === 'designCriteria' && <DesignCriteriaSection />}
          {activeSection === 'trafficPlanningCriteria' && <TrafficPlanningCriteriaSection />}
          {activeSection === 'urbanSpacingPlanningCriteria' && (
            <UrbanSpacingPlanningCriteriaSection />
          )}
          {activeSection === 'maintenanceNeeds' && <MaintenanceNeedsSection />}
          {activeSection === 'interactionAndRelatedProjects' && (
            <InteractionAndRelatedProjectsSection />
          )}
          {activeSection === 'otherAttachments' && (
            <OtherAttachmentsSection
              projectProgrammeId={projectProgrammeId}
              saveError={attachmentSaveError}
            />
          )}
        </fieldset>

        <div className="project-form-banner">
          <div className="project-form-banner-container">
            <div className="project-programme-actions">
              {!isFormReadOnly && (
                <>
                  <Button
                    variant={ButtonVariant.Primary}
                    type="button"
                    onClick={handleSubmit(handleMarkSectionReady)}
                  >
                    {t('projectProgrammeForm.markSectionReady')}
                  </Button>
                  <Button
                    variant={ButtonVariant.Secondary}
                    type="button"
                    disabled={!isDirty}
                    onClick={() => submitDraft(getValues(), activeSection)}
                  >
                    {t('projectProgrammeForm.saveDraft')}
                  </Button>
                </>
              )}
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
