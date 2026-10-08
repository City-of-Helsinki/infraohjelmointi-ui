import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSectionTitle, TextField } from '@/components/shared';
import { useProjectProgrammeTooltip } from '@/hooks/useProjectProgrammeTooltip';
import TextAreaField from '@/components/shared/TextAreaField';
import { validateMaxLength } from '@/utils/validation';
import {
  getFieldPropsForProjectProgrammeForm,
  getRequiredFieldNames,
  requiredTrimmedRule,
} from '@/utils/projectProgrammeUtils';
import ProjectProgrammeLinksField from '../ProjectProgrammeLinksField';

interface IBasicInfoSectionProps {
  briefProgramme: boolean;
}

export const BASIC_INFO_BRIEF_FIELDS = [
  { field: 'projectName' },
  { field: 'district' },
  { field: 'projectProgrammeCompiler' },
  { field: 'personsInvolved', required: false },
  { field: 'estimatedCosts' },
  { field: 'inspector', required: false },
  { field: 'summary' },
] as const;

export const BASIC_INFO_FULL_FIELDS = [
  { field: 'projectName' },
  { field: 'district' },
  { field: 'projectProgrammeCompiler' },
  { field: 'personsInvolved' },
  { field: 'inspector', required: false },
  { field: 'summary' },
  { field: 'strategyGoals' },
  { field: 'costClass' },
  { field: 'projectSize' },
  { field: 'risks' },
  { field: 'studyAndPlanningNeeds' },
  { field: 'planningAndImplementationFeasibility' },
  { field: 'specialConsiderations', required: false },
  { field: 'otherConsiderations', required: false },
] as const;

function BasicInfoSection({ briefProgramme }: Readonly<IBasicInfoSectionProps>) {
  const { t } = useTranslation();
  const tooltip = useProjectProgrammeTooltip();
  const requiredFields = getRequiredFieldNames(
    briefProgramme ? BASIC_INFO_BRIEF_FIELDS : BASIC_INFO_FULL_FIELDS,
  );
  const requiredRule = (field: string) =>
    requiredFields.includes(field) ? requiredTrimmedRule(`projectProgrammeForm.${field}`, t) : {};

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
          ...requiredRule('projectName'),
        }}
      />
      <div className="flex w-full gap-6">
        <div className="flex-1">
          <TextField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.district')}
            size="full"
            rules={{
              ...validateMaxLength(200, t),
              ...requiredRule('district'),
            }}
          />
        </div>
        <div className="flex-1">
          <TextField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.projectProgrammeCompiler')}
            size="full"
            rules={{
              ...validateMaxLength(100, t),
              ...requiredRule('projectProgrammeCompiler'),
            }}
          />
        </div>
      </div>
      <TextField
        {...getFieldPropsForProjectProgrammeForm('basicInfo.personsInvolved')}
        size="full"
        rules={{
          ...validateMaxLength(200, t),
          ...requiredRule('personsInvolved'),
        }}
      />
      {briefProgramme && (
        <TextField
          {...getFieldPropsForProjectProgrammeForm('basicInfo.estimatedCosts')}
          size="full"
          rules={{
            ...validateMaxLength(200, t),
            ...requiredRule('estimatedCosts'),
          }}
        />
      )}
      <TextField
        {...getFieldPropsForProjectProgrammeForm('basicInfo.inspector')}
        size="full"
        rules={{
          ...validateMaxLength(100, t),
        }}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('basicInfo.summary')}
        rules={{ ...requiredRule('summary') }}
        tooltip={tooltip('summary')}
      />
      {!briefProgramme && (
        <>
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.strategyGoals')}
            rules={{ ...requiredRule('strategyGoals') }}
            tooltip={tooltip('strategyGoals')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.costClass')}
            rules={{ ...requiredRule('costClass') }}
            tooltip={tooltip('costClass')}
          />
          <TextField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.projectSize')}
            size="full"
            rules={{
              ...validateMaxLength(200, t),
              ...requiredRule('projectSize'),
            }}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.risks')}
            rules={{ ...requiredRule('risks') }}
            tooltip={tooltip('risks')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.studyAndPlanningNeeds')}
            rules={{ ...requiredRule('studyAndPlanningNeeds') }}
            tooltip={tooltip('studyAndPlanningNeeds')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm(
              'basicInfo.planningAndImplementationFeasibility',
            )}
            rules={{ ...requiredRule('planningAndImplementationFeasibility') }}
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

export default memo(BasicInfoSection);
