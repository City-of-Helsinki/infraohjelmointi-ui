import { memo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, IconPlus, Tooltip } from 'hds-react';
import { FormSectionTitle, TextField } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { IProjectProgrammeForm } from '@/interfaces/projectProgrammeInterfaces';
import { getFieldPropsForProjectProgrammeForm, requiredRule } from '@/utils/projectProgrammeUtils';

function DesignCriteriaForm() {
  const { t } = useTranslation();
  const { control } = useFormContext<IProjectProgrammeForm>();
  const { fields: linkFields, append } = useFieldArray({
    control,
    name: 'designCriteria.links',
    keyName: 'formId',
  });

  const tooltip = (fieldName: string) => (
    <Tooltip>{t(`projectProgrammeForm.${fieldName}Tooltip`)}</Tooltip>
  );

  return (
    <div className="mb-12" data-testid="project-programme-design-criteria-form">
      <FormSectionTitle
        name="projectProgrammeDesignCriteria"
        label="projectProgrammeForm.designCriteriaSectionTitle"
      />
      <p className="mb-8">{t('projectProgrammeForm.designCriteriaSectionText')}</p>
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('designCriteria.guidingZoningRegulations')}
        rules={{ ...requiredRule('projectProgrammeForm.guidingZoningRegulations', t) }}
        tooltip={tooltip('guidingZoningRegulations')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('designCriteria.relationshipToPublicAreaServices')}
        rules={{ ...requiredRule('projectProgrammeForm.relationshipToPublicAreaServices', t) }}
        tooltip={tooltip('relationshipToPublicAreaServices')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm(
          'designCriteria.siteValuesProtectionAndSignificance',
        )}
        rules={{ ...requiredRule('projectProgrammeForm.siteValuesProtectionAndSignificance', t) }}
        tooltip={tooltip('siteValuesProtectionAndSignificance')}
      />
      <div className="input-wrapper" id="projectProgrammeLinksTitle">
        <h4 className="text-heading-s">{t('projectProgrammeForm.links')}</h4>
      </div>
      {linkFields.map((field, index) => {
        const translatedLabel = `${t('projectProgrammeForm.linkLabel')} ${index + 1}`;
        return (
          <TextField
            key={field.formId}
            name={`designCriteria.links.${index}.value`}
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

export default memo(DesignCriteriaForm);
