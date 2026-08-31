import { Button, ButtonVariant, IconPen, StatusLabel } from 'hds-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormProvider } from 'react-hook-form';
import useProjectProgrammeForm from '@/forms/useProjectProgrammeForm';
import { usePatchProjectProgrammeSectionMutation } from '@/api/projectProgrammeApi';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { useAppDispatch } from '@/hooks/common';
import ProjectProgrammeBasicInfoForm from './ProjectProgrammeBasicInfoForm';
import { mapSectionIdToApiRoute, ProjectProgrammeSectionId } from './projectProgrammeSections';
import {
  IProjectProgrammeBasicInfo,
  IProjectProgrammeDesignCriteria,
  IProjectProgrammeForm,
} from '@/interfaces/projectProgrammeInterfaces';

interface IProjectProgrammeFormProps {
  projectProgrammeId: string;
  activeSection: ProjectProgrammeSectionId;
  basicInfo?: IProjectProgrammeBasicInfo;
  designCriteria?: IProjectProgrammeDesignCriteria;
  briefProgramme: boolean;
  onClose: () => void;
}

type BasicInfoFormField = Exclude<keyof IProjectProgrammeForm['basicInfo'], 'links'>;
type BasicInfoDirtyFields = Partial<Record<BasicInfoFormField, boolean>> & { links?: unknown };

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

const BASIC_INFO_FORM_FIELDS: BasicInfoFormField[] = [
  'projectName',
  'district',
  'projectProgrammeCompiler',
  'personsInvolved',
  'estimatedCosts',
  'inspector',
  'summary',
  'strategyGoals',
  'costClass',
  'projectSize',
  'risks',
  'studyAndPlanningNeeds',
  'planningAndImplementationFeasibility',
  'specialConsiderations',
  'otherConsiderations',
];

type DesignCriteriaFormField = Exclude<keyof IProjectProgrammeForm['designCriteria'], 'links'>;
type DesignCriteriaDirtyFields = Partial<Record<DesignCriteriaFormField, boolean>> & {
  links?: unknown;
};

const DESIGN_CRITERIA_FORM_TO_API_FIELD: Record<DesignCriteriaFormField, string> = {
  guidingZoningRegulations: 'guidingZoningRegulations',
  siteValuesProtectionAndSignificance: 'siteValuesProtectionAndSignificance',
  relationshipToPublicAreaServices: 'relationshipToPublicAreaServices',
};

const DESIGN_CRITERIA_FORM_FIELDS: DesignCriteriaFormField[] = [
  'guidingZoningRegulations',
  'siteValuesProtectionAndSignificance',
  'relationshipToPublicAreaServices',
];

export function pickChangedBasicInfoFields(
  formData: IProjectProgrammeForm,
  basicInfoDirtyFields: Partial<Record<BasicInfoFormField, boolean>>,
  designCriteriaDirtyFields?: Partial<Record<DesignCriteriaFormField, boolean>>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  BASIC_INFO_FORM_FIELDS.forEach((field) => {
    if (basicInfoDirtyFields[field]) {
      payload[BASIC_INFO_FORM_TO_API_FIELD[field]] = formData.basicInfo?.[field];
    }
  });

  DESIGN_CRITERIA_FORM_FIELDS.forEach((field) => {
    if (designCriteriaDirtyFields?.[field]) {
      payload[DESIGN_CRITERIA_FORM_TO_API_FIELD[field]] = formData.designCriteria?.[field];
    }
  });

  return payload;
}

export function pickChangedLinks(
  formSection: ProjectProgrammeSectionId,
  formData: IProjectProgrammeForm,
  dirtyFields: BasicInfoDirtyFields | DesignCriteriaDirtyFields,
): string[] | undefined {
  if (!dirtyFields.links) {
    return undefined;
  }

  return (
    formData[formSection]?.links
      ?.map((link) => link.value.trim())
      .filter((linkValue) => linkValue.length > 0) ?? undefined
  );
}

function ProjectProgrammeForm({
  projectProgrammeId,
  activeSection,
  basicInfo,
  designCriteria,
  briefProgramme,
  onClose,
}: Readonly<IProjectProgrammeFormProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formMethods = useProjectProgrammeForm({ basicInfo, designCriteria });
  const {
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = formMethods;
  const [patchProjectProgrammeSection] = usePatchProjectProgrammeSectionMutation();

  async function submitDraft(data: IProjectProgrammeForm) {
    if (activeSection !== 'basicInfo') return;

    const requestData: Record<string, unknown> = pickChangedBasicInfoFields(
      data,
      dirtyFields.basicInfo ?? {},
      dirtyFields.designCriteria ?? {},
    );
    const linksPayload = pickChangedLinks('basicInfo', data, dirtyFields.basicInfo ?? {});

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
