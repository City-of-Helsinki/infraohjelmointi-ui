import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSectionTitle } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { getFieldPropsForProjectProgrammeForm, requiredRule } from '@/utils/projectProgrammeUtils';
import ProjectProgrammeLinksField, {
  useProjectProgrammeTooltip,
} from './ProjectProgrammeLinksField';

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
      <ProjectProgrammeLinksField section="designCriteria" />
    </div>
  );
}

export default memo(DesignCriteriaForm);
