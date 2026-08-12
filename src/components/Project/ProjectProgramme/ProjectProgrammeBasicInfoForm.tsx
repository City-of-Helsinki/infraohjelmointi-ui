import { memo } from 'react';
import { FieldPath, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, IconPlus, Tooltip } from 'hds-react';
import { FormSectionTitle, TextField } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { IProjectProgrammeForm } from '@/forms/useProjectProgrammeForm';
import { validateMaxLength } from '@/utils/validation';

export function getFieldProps(name: FieldPath<IProjectProgrammeForm>) {
  return {
    name,
    label: `projectProgrammeForm.${name}`,
  };
}

function ProjectProgrammeBasicInfoForm() {
  const { t } = useTranslation();
  const { control } = useFormContext<IProjectProgrammeForm>();
  const { fields: linkFields, append } = useFieldArray({
    control,
    name: 'links',
    keyName: 'formId',
  });

  const requiredRule = (labelKey: string) => ({
    required: t('validation.required', { field: t(labelKey) }),
  });

  const tooltip = (fieldName: string) => (
    <Tooltip>{t(`projectProgrammeForm.${fieldName}Tooltip`)}</Tooltip>
  );

  return (
    <div className="mb-12" data-testid="project-programme-basic-info-form">
      <FormSectionTitle
        name="projectProgrammeBasicInfo"
        label="projectProgrammeForm.basicInfoSectionTitle"
      />
      <p className="mb-8">{t('projectProgrammeForm.basicInfoSectionText')}</p>
      <TextField
        {...getFieldProps('projectName')}
        size="full"
        rules={{
          ...validateMaxLength(200, t),
          ...requiredRule('projectProgrammeForm.projectName'),
        }}
      />
      <div className="flex w-full gap-6">
        <div className="flex-1">
          <TextField
            {...getFieldProps('district')}
            size="full"
            rules={{
              ...validateMaxLength(200, t),
              ...requiredRule('projectProgrammeForm.district'),
            }}
          />
        </div>
        <div className="flex-1">
          <TextField
            {...getFieldProps('projectProgrammeCompiler')}
            size="full"
            rules={{
              ...validateMaxLength(100, t),
              ...requiredRule('projectProgrammeForm.projectProgrammeCompiler'),
            }}
          />
        </div>
      </div>
      <TextField
        {...getFieldProps('personsInvolved')}
        size="full"
        rules={{
          ...validateMaxLength(200, t),
          ...requiredRule('projectProgrammeForm.personsInvolved'),
        }}
      />
      <TextField
        {...getFieldProps('inspector')}
        size="full"
        rules={{ ...validateMaxLength(100, t) }}
      />
      <TextAreaField
        {...getFieldProps('summary')}
        rules={{ ...requiredRule('projectProgrammeForm.summary') }}
        tooltip={tooltip('summary')}
      />
      <TextAreaField
        {...getFieldProps('strategyGoals')}
        rules={{ ...requiredRule('projectProgrammeForm.strategyGoals') }}
        tooltip={tooltip('strategyGoals')}
      />
      <TextAreaField
        {...getFieldProps('costClass')}
        rules={{ ...requiredRule('projectProgrammeForm.costClass') }}
        tooltip={tooltip('costClass')}
      />
      <TextField
        {...getFieldProps('projectSize')}
        size="full"
        rules={{
          ...validateMaxLength(200, t),
          ...requiredRule('projectProgrammeForm.projectSize'),
        }}
      />
      <TextAreaField
        {...getFieldProps('risks')}
        rules={{ ...requiredRule('projectProgrammeForm.risks') }}
        tooltip={tooltip('risks')}
      />
      <TextAreaField
        {...getFieldProps('studyAndPlanningNeeds')}
        rules={{ ...requiredRule('projectProgrammeForm.studyAndPlanningNeeds') }}
        tooltip={tooltip('studyAndPlanningNeeds')}
      />
      <TextAreaField
        {...getFieldProps('planningAndImplementationFeasibility')}
        rules={{ ...requiredRule('projectProgrammeForm.planningAndImplementationFeasibility') }}
        tooltip={tooltip('planningAndImplementationFeasibility')}
      />
      <TextAreaField
        {...getFieldProps('specialConsiderations')}
        tooltip={tooltip('specialConsiderations')}
      />
      <TextAreaField {...getFieldProps('otherConsiderations')} />

      <div className="input-wrapper" id="projectProgrammeLinksTitle">
        <h4 className="text-heading-s">{t('projectProgrammeForm.links')}</h4>
      </div>
      {linkFields.map((field, index) => {
        const translatedLabel = `${t('projectProgrammeForm.linkLabel')} ${index + 1}`;
        return (
          <TextField
            key={field.formId}
            name={`links.${index}.value`}
            label={translatedLabel}
            size="full"
          />
        );
      })}
      <div className="input-wrapper" id="projectProgrammeAddLinkButton">
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          iconStart={<IconPlus />}
          onClick={() => append({ value: '' })}
        >
          {t('projectProgrammeForm.addNewLink')}
        </Button>
      </div>
    </div>
  );
}

export default memo(ProjectProgrammeBasicInfoForm);
