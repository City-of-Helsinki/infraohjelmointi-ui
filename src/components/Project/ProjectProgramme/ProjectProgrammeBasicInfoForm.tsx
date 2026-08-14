import { memo } from 'react';
import { FieldPath, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, IconPlus, Tooltip } from 'hds-react';
import { FormSectionTitle, TextField } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { IProjectProgrammeForm } from '@/forms/useProjectProgrammeForm';
import { validateMaxLength } from '@/utils/validation';

export function getFieldProps(name: FieldPath<IProjectProgrammeForm>) {
  const fieldName = name.split('.').at(-1) ?? name;

  return {
    name,
    label: `projectProgrammeForm.${fieldName}`,
  };
}

interface IProjectProgrammeBasicInfoFormProps {
  briefProgramme: boolean;
}

function ProjectProgrammeBasicInfoForm({
  briefProgramme,
}: Readonly<IProjectProgrammeBasicInfoFormProps>) {
  const { t } = useTranslation();
  const { control } = useFormContext<IProjectProgrammeForm>();
  const { fields: linkFields, append } = useFieldArray({
    control,
    name: 'basicInfo.links',
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
        {...getFieldProps('basicInfo.projectName')}
        size="full"
        rules={{
          ...validateMaxLength(200, t),
          ...requiredRule('projectProgrammeForm.projectName'),
        }}
      />
      <div className="flex w-full gap-6">
        <div className="flex-1">
          <TextField
            {...getFieldProps('basicInfo.district')}
            size="full"
            rules={{
              ...validateMaxLength(200, t),
              ...requiredRule('projectProgrammeForm.district'),
            }}
          />
        </div>
        <div className="flex-1">
          <TextField
            {...getFieldProps('basicInfo.projectProgrammeCompiler')}
            size="full"
            rules={{
              ...validateMaxLength(100, t),
              ...requiredRule('projectProgrammeForm.projectProgrammeCompiler'),
            }}
          />
        </div>
      </div>
      <TextField
        {...getFieldProps('basicInfo.personsInvolved')}
        size="full"
        rules={{
          ...validateMaxLength(200, t),
          ...requiredRule('projectProgrammeForm.personsInvolved'),
        }}
      />
      {briefProgramme && (
        <TextField
          {...getFieldProps('basicInfo.estimatedCosts')}
          size="full"
          rules={{
            ...validateMaxLength(200, t),
            ...requiredRule('projectProgrammeForm.estimatedCosts'),
          }}
        />
      )}
      <TextField
        {...getFieldProps('basicInfo.inspector')}
        size="full"
        rules={{
          ...validateMaxLength(100, t),
          ...(briefProgramme && requiredRule('projectProgrammeForm.inspector')),
        }}
      />
      <TextAreaField
        {...getFieldProps('basicInfo.summary')}
        rules={{ ...requiredRule('projectProgrammeForm.summary') }}
        tooltip={tooltip('summary')}
      />
      {!briefProgramme && (
        <>
          <TextAreaField
            {...getFieldProps('basicInfo.strategyGoals')}
            rules={{ ...requiredRule('projectProgrammeForm.strategyGoals') }}
            tooltip={tooltip('strategyGoals')}
          />
          <TextAreaField
            {...getFieldProps('basicInfo.costClass')}
            rules={{ ...requiredRule('projectProgrammeForm.costClass') }}
            tooltip={tooltip('costClass')}
          />
          <TextField
            {...getFieldProps('basicInfo.projectSize')}
            size="full"
            rules={{
              ...validateMaxLength(200, t),
              ...requiredRule('projectProgrammeForm.projectSize'),
            }}
          />
          <TextAreaField
            {...getFieldProps('basicInfo.risks')}
            rules={{ ...requiredRule('projectProgrammeForm.risks') }}
            tooltip={tooltip('risks')}
          />
          <TextAreaField
            {...getFieldProps('basicInfo.studyAndPlanningNeeds')}
            rules={{ ...requiredRule('projectProgrammeForm.studyAndPlanningNeeds') }}
            tooltip={tooltip('studyAndPlanningNeeds')}
          />
          <TextAreaField
            {...getFieldProps('basicInfo.planningAndImplementationFeasibility')}
            rules={{ ...requiredRule('projectProgrammeForm.planningAndImplementationFeasibility') }}
            tooltip={tooltip('planningAndImplementationFeasibility')}
          />
          <TextAreaField
            {...getFieldProps('basicInfo.specialConsiderations')}
            tooltip={tooltip('specialConsiderations')}
          />
          <TextAreaField {...getFieldProps('basicInfo.otherConsiderations')} />
        </>
      )}

      <div className="input-wrapper" id="projectProgrammeLinksTitle">
        <h4 className="text-heading-s">{t('projectProgrammeForm.links')}</h4>
      </div>
      {linkFields.map((field, index) => {
        const translatedLabel = `${t('projectProgrammeForm.linkLabel')} ${index + 1}`;
        return (
          <TextField
            key={field.formId}
            name={`basicInfo.links.${index}.value`}
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
