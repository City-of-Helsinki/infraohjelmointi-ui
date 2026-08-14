import { Button, ButtonVariant, IconPen, StatusLabel } from 'hds-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormProvider } from 'react-hook-form';
import { IProjectProgrammeBasicInfo } from '@/interfaces/projectProgrammeInterfaces';
import useProjectProgrammeForm, { IProjectProgrammeForm } from '@/forms/useProjectProgrammeForm';
import { usePatchProjectProgrammeSectionMutation } from '@/api/projectProgrammeApi';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { useAppDispatch } from '@/hooks/common';
import ProjectProgrammeBasicInfoForm from './ProjectProgrammeBasicInfoForm';
import { mapSectionIdToApiRoute, ProjectProgrammeSectionId } from './projectProgrammeSections';

type BasicInfoFormField = Exclude<keyof IProjectProgrammeForm['basicInfo'], 'links'>;

interface IProjectProgrammeFormProps {
  projectProgrammeId: string;
  activeSection: ProjectProgrammeSectionId;
  basicInfo: IProjectProgrammeBasicInfo | null;
  briefProgramme: boolean;
  onClose: () => void;
}

const BASIC_INFO_FORM_TO_API_FIELD: Record<BasicInfoFormField, string> = {
  projectName: 'projectName',
  district: 'district',
  projectProgrammeCompiler: 'projectProgrammeCompiler',
  personsInvolved: 'personsInvolved',
  estimatedCosts: 'estimatedCosts',
  inspector: 'inspector',
  summary: 'summary',
  strategyGoals: 'strategyGoals',
  costClass: 'costClass',
  projectSize: 'projectSize',
  risks: 'risks',
  studyAndPlanningNeeds: 'studyAndPlanningNeeds',
  planningAndImplementationFeasibility: 'planningAndImplementationFeasibility',
  specialConsiderations: 'specialConsiderations',
  otherConsiderations: 'otherConsiderations',
};

export function pickChangedBasicInfoFields(
  formData: IProjectProgrammeForm,
  dirtyFields: Partial<Record<BasicInfoFormField, boolean>>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  (Object.keys(BASIC_INFO_FORM_TO_API_FIELD) as BasicInfoFormField[]).forEach((field) => {
    if (dirtyFields[field]) {
      payload[BASIC_INFO_FORM_TO_API_FIELD[field]] = formData.basicInfo[field];
    }
  });

  return payload;
}

export function pickChangedLinks(
  formData: IProjectProgrammeForm,
  dirtyFields: Partial<Record<keyof IProjectProgrammeForm['basicInfo'], unknown>>,
): string[] | null {
  if (!dirtyFields.links) {
    return null;
  }

  return formData.basicInfo.links
    .map((link) => link.value.trim())
    .filter((linkValue) => linkValue.length > 0);
}

function ProjectProgrammeForm({
  projectProgrammeId,
  activeSection,
  basicInfo,
  briefProgramme,
  onClose,
}: Readonly<IProjectProgrammeFormProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formMethods = useProjectProgrammeForm(basicInfo);
  const {
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = formMethods;
  const [patchProjectProgrammeSection] = usePatchProjectProgrammeSectionMutation();

  async function submitDraft(data: IProjectProgrammeForm) {
    if (activeSection !== 'basicInfo') return;

    const requestData: Record<string, unknown> = pickChangedBasicInfoFields(
      data,
      dirtyFields.basicInfo as Partial<Record<BasicInfoFormField, boolean>>,
    );
    const linksPayload = pickChangedLinks(
      data,
      dirtyFields.basicInfo as Partial<Record<keyof IProjectProgrammeForm['basicInfo'], unknown>>,
    );

    if (linksPayload !== null) {
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
        onSubmit={handleSubmit(submitDraft)}
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
