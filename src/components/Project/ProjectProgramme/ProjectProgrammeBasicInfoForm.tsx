import { memo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, IconPlus, Tooltip } from 'hds-react';
import { FormSectionTitle, TextField } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { validateMaxLength } from '@/utils/validation';
import { getFieldPropsForProjectProgrammeForm, requiredRule } from '@/utils/projectProgrammeUtils';
import type { IProjectProgrammeForm } from '@/interfaces/projectProgrammeInterfaces';

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
        {...getFieldPropsForProjectProgrammeForm('basicInfo.projectName')}
        size="full"
        rules={{
          ...validateMaxLength(200, t),
          ...requiredRule('projectProgrammeForm.projectName', t),
        }}
      />
      <div className="flex w-full gap-6">
        <div className="flex-1">
          <TextField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.district')}
            size="full"
            rules={{
              ...validateMaxLength(200, t),
              ...requiredRule('projectProgrammeForm.district', t),
            }}
          />
        </div>
        <div className="flex-1">
          <TextField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.projectProgrammeCompiler')}
            size="full"
            rules={{
              ...validateMaxLength(100, t),
              ...requiredRule('projectProgrammeForm.projectProgrammeCompiler', t),
            }}
          />
        </div>
      </div>
      <TextField
        {...getFieldPropsForProjectProgrammeForm('basicInfo.personsInvolved')}
        size="full"
        rules={{
          ...validateMaxLength(200, t),
          ...requiredRule('projectProgrammeForm.personsInvolved', t),
        }}
      />
      {briefProgramme && (
        <TextField
          {...getFieldPropsForProjectProgrammeForm('basicInfo.estimatedCosts')}
          size="full"
          rules={{
            ...validateMaxLength(200, t),
            ...requiredRule('projectProgrammeForm.estimatedCosts', t),
          }}
        />
      )}
      <TextField
        {...getFieldPropsForProjectProgrammeForm('basicInfo.inspector')}
        size="full"
        rules={{
          ...validateMaxLength(100, t),
          ...(briefProgramme && requiredRule('projectProgrammeForm.inspector', t)),
        }}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('basicInfo.summary')}
        rules={{ ...requiredRule('projectProgrammeForm.summary', t) }}
        tooltip={tooltip('summary')}
      />
      {!briefProgramme && (
        <>
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.strategyGoals')}
            rules={{ ...requiredRule('projectProgrammeForm.strategyGoals', t) }}
            tooltip={tooltip('strategyGoals')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.costClass')}
            rules={{ ...requiredRule('projectProgrammeForm.costClass', t) }}
            tooltip={tooltip('costClass')}
          />
          <TextField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.projectSize')}
            size="full"
            rules={{
              ...validateMaxLength(200, t),
              ...requiredRule('projectProgrammeForm.projectSize', t),
            }}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.risks')}
            rules={{ ...requiredRule('projectProgrammeForm.risks', t) }}
            tooltip={tooltip('risks')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.studyAndPlanningNeeds')}
            rules={{ ...requiredRule('projectProgrammeForm.studyAndPlanningNeeds', t) }}
            tooltip={tooltip('studyAndPlanningNeeds')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm(
              'basicInfo.planningAndImplementationFeasibility',
            )}
            rules={{
              ...requiredRule('projectProgrammeForm.planningAndImplementationFeasibility', t),
            }}
            tooltip={tooltip('planningAndImplementationFeasibility')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.specialConsiderations')}
            rules={{ ...requiredRule('projectProgrammeForm.specialConsiderations', t) }}
            tooltip={tooltip('specialConsiderations')}
          />
          <TextAreaField
            {...getFieldPropsForProjectProgrammeForm('basicInfo.otherConsiderations')}
            rules={{ ...requiredRule('projectProgrammeForm.otherConsiderations', t) }}
          />
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
