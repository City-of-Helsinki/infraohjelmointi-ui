import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSectionTitle, TextField } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { validateMaxLength } from '@/utils/validation';
import { getFieldPropsForProjectProgrammeForm } from '@/utils/projectProgrammeUtils';
import ProjectProgrammeLinksField, {
  useProjectProgrammeTooltip,
} from './ProjectProgrammeLinksField';
import { requiredTrimmedRule } from '@/utils/projectProgrammeUtils';

interface IProjectProgrammeBasicInfoFormProps {
  briefProgramme: boolean;
}

function ProjectProgrammeBasicInfoForm({
  briefProgramme,
}: Readonly<IProjectProgrammeBasicInfoFormProps>) {
  const { t } = useTranslation();
  const tooltip = useProjectProgrammeTooltip();

  return (
    <div className="mb-12" data-testid="project-programme-basic-info-form">
      <FormSectionTitle
        name="projectProgrammeBasicInfo"
        label="projectProgrammeForm.basicInfoSectionTitle"
      />
      <p className="mb-8">{t('projectProgrammeForm.requiredSectionHelperText')}</p>
      <TextField
        {...getFieldPropsForProjectProgrammeForm('basicInfo.projectName')}
        size="full"
        rules={{
          ...validateMaxLength(200, t),
          ...requiredTrimmedRule('projectProgrammeForm.projectName', t),
        }}
      />
      <div className="flex w-full gap-6">
        <div className="flex-1">
          <TextField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.district')}
            size="full"
            rules={{
              ...validateMaxLength(200, t),
              ...requiredTrimmedRule('projectProgrammeForm.district', t),
            }}
          />
        </div>
        <div className="flex-1">
          <TextField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.projectProgrammeCompiler')}
            size="full"
            rules={{
              ...validateMaxLength(100, t),
              ...requiredTrimmedRule('projectProgrammeForm.projectProgrammeCompiler', t),
            }}
          />
        </div>
      </div>
      <TextField
        {...getFieldPropsForProjectProgrammeForm('basicInfo.personsInvolved')}
        size="full"
        rules={{
          ...validateMaxLength(200, t),
          ...requiredTrimmedRule('projectProgrammeForm.personsInvolved', t),
        }}
      />
      {briefProgramme && (
        <TextField
          {...getFieldPropsForProjectProgrammeForm('basicInfo.estimatedCosts')}
          size="full"
          rules={{
            ...validateMaxLength(200, t),
            ...requiredTrimmedRule('projectProgrammeForm.estimatedCosts', t),
          }}
        />
      )}
      <TextField
        {...getFieldPropsForProjectProgrammeForm('basicInfo.inspector')}
        size="full"
        rules={{
          ...validateMaxLength(100, t),
          ...(briefProgramme && requiredTrimmedRule('projectProgrammeForm.inspector', t)),
        }}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('basicInfo.summary')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.summary', t) }}
        tooltip={tooltip('summary')}
      />
      {!briefProgramme && (
        <>
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.strategyGoals')}
            rules={{ ...requiredTrimmedRule('projectProgrammeForm.strategyGoals', t) }}
            tooltip={tooltip('strategyGoals')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.costClass')}
            rules={{ ...requiredTrimmedRule('projectProgrammeForm.costClass', t) }}
            tooltip={tooltip('costClass')}
          />
          <TextField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.projectSize')}
            size="full"
            rules={{
              ...validateMaxLength(200, t),
              ...requiredTrimmedRule('projectProgrammeForm.projectSize', t),
            }}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.risks')}
            rules={{ ...requiredTrimmedRule('projectProgrammeForm.risks', t) }}
            tooltip={tooltip('risks')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.studyAndPlanningNeeds')}
            rules={{ ...requiredTrimmedRule('projectProgrammeForm.studyAndPlanningNeeds', t) }}
            tooltip={tooltip('studyAndPlanningNeeds')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm(
              'basicInfo.planningAndImplementationFeasibility',
            )}
            rules={{
              ...requiredTrimmedRule(
                'projectProgrammeForm.planningAndImplementationFeasibility',
                t,
              ),
            }}
            tooltip={tooltip('planningAndImplementationFeasibility')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.specialConsiderations')}
            tooltip={tooltip('specialConsiderations')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.otherConsiderations')}
            tooltip={tooltip('otherConsiderations')}
          />
        </>
      )}

      <ProjectProgrammeLinksField section="basicInfo" />
    </div>
  );
}

export default memo(ProjectProgrammeBasicInfoForm);
