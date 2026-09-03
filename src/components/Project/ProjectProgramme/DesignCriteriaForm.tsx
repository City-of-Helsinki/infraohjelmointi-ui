import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSectionTitle } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { getFieldPropsForProjectProgrammeForm } from '@/utils/projectProgrammeUtils';
import ProjectProgrammeLinksField, {
  useProjectProgrammeTooltip,
} from './ProjectProgrammeLinksField';
import { requiredTrimmedRule } from '@/utils/projectProgrammeUtils';

function DesignCriteriaForm() {
  const { t } = useTranslation();
  const tooltip = useProjectProgrammeTooltip();

  return (
    <div className="mb-12" data-testid="project-programme-design-criteria-form">
      <FormSectionTitle
        name="projectProgrammeDesignCriteria"
        label="projectProgrammeForm.designCriteriaSectionTitle"
      />
      <p className="mb-8">{t('projectProgrammeForm.requiredSectionHelperText')}</p>
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('designCriteria.guidingZoningRegulations')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.guidingZoningRegulations', t) }}
        tooltip={tooltip('guidingZoningRegulations')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('designCriteria.relationshipToPublicAreaServices')}
        rules={{
          ...requiredTrimmedRule('projectProgrammeForm.relationshipToPublicAreaServices', t),
        }}
        tooltip={tooltip('relationshipToPublicAreaServices')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm(
          'designCriteria.siteValuesProtectionAndSignificance',
        )}
        rules={{
          ...requiredTrimmedRule('projectProgrammeForm.siteValuesProtectionAndSignificance', t),
        }}
        tooltip={tooltip('siteValuesProtectionAndSignificance')}
      />
      <ProjectProgrammeLinksField section="designCriteria" />
    </div>
  );
}

export default memo(DesignCriteriaForm);
