import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSectionTitle } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import {
  getFieldPropsForProjectProgrammeForm,
  requiredTrimmedRule,
} from '@/utils/projectProgrammeUtils';
import ProjectProgrammeLinksField, {
  useProjectProgrammeTooltip,
} from './ProjectProgrammeLinksField';

function UrbanSpacingPlanningCriteriaSection() {
  const { t } = useTranslation();
  const tooltip = useProjectProgrammeTooltip();

  return (
    <div className="mb-12" data-testid="project-programme-urban-spacing-planning-criteria-form">
      <FormSectionTitle
        name="projectProgrammeUrbanSpacingPlanningCriteria"
        label="projectProgrammeForm.urbanSpacingPlanningCriteriaSectionTitle"
      />
      <p className="mb-8">{t('projectProgrammeForm.requiredSectionHelperText')}</p>
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm(
          'urbanSpacingPlanningCriteria.targetUrbanAppearance',
        )}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.targetUrbanAppearance', t) }}
        tooltip={tooltip('targetUrbanAppearance')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('urbanSpacingPlanningCriteria.surfaceMaterials')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.surfaceMaterials', t) }}
        tooltip={tooltip('surfaceMaterials')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('urbanSpacingPlanningCriteria.structures')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.structures', t) }}
        tooltip={tooltip('structures')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm(
          'urbanSpacingPlanningCriteria.technicalNetworksAndSystems',
        )}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.technicalNetworksAndSystems', t) }}
        tooltip={tooltip('technicalNetworksAndSystems')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('urbanSpacingPlanningCriteria.lighting')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.lighting', t) }}
        tooltip={tooltip('lighting')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('urbanSpacingPlanningCriteria.greenery')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.greenery', t) }}
        tooltip={tooltip('greenery')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm(
          'urbanSpacingPlanningCriteria.lumoConsiderationAndProtection',
        )}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.lumoConsiderationAndProtection', t) }}
        tooltip={tooltip('lumoConsiderationAndProtection')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('urbanSpacingPlanningCriteria.natureTypes')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.natureTypes', t) }}
        tooltip={tooltip('natureTypes')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm(
          'urbanSpacingPlanningCriteria.equipmentAndFurnishings',
        )}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.equipmentAndFurnishings', t) }}
        tooltip={tooltip('equipmentAndFurnishings')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('urbanSpacingPlanningCriteria.waters')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.waters', t) }}
        tooltip={tooltip('waters')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm(
          'urbanSpacingPlanningCriteria.stormwaterManagement',
        )}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.stormwaterManagement', t) }}
        tooltip={tooltip('stormwaterManagement')}
      />
      <ProjectProgrammeLinksField section="urbanSpacingPlanningCriteria" />
    </div>
  );
}

export default memo(UrbanSpacingPlanningCriteriaSection);
