import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSectionTitle } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { getFieldPropsForProjectProgrammeForm, requiredRule } from '@/utils/projectProgrammeUtils';
import ProjectProgrammeLinksField, {
  useProjectProgrammeTooltip,
} from './ProjectProgrammeLinksField';

function UrbanSpacingPlanningCriteriaForm() {
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
        rules={{ ...requiredRule('projectProgrammeForm.targetUrbanAppearance', t) }}
        tooltip={tooltip('targetUrbanAppearance')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('urbanSpacingPlanningCriteria.surfaceMaterials')}
        rules={{ ...requiredRule('projectProgrammeForm.surfaceMaterials', t) }}
        tooltip={tooltip('surfaceMaterials')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('urbanSpacingPlanningCriteria.structures')}
        rules={{ ...requiredRule('projectProgrammeForm.structures', t) }}
        tooltip={tooltip('structures')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm(
          'urbanSpacingPlanningCriteria.technicalNetworksAndSystems',
        )}
        rules={{ ...requiredRule('projectProgrammeForm.technicalNetworksAndSystems', t) }}
        tooltip={tooltip('technicalNetworksAndSystems')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('urbanSpacingPlanningCriteria.lighting')}
        rules={{ ...requiredRule('projectProgrammeForm.lighting', t) }}
        tooltip={tooltip('lighting')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('urbanSpacingPlanningCriteria.greenery')}
        rules={{ ...requiredRule('projectProgrammeForm.greenery', t) }}
        tooltip={tooltip('greenery')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm(
          'urbanSpacingPlanningCriteria.lumoConsiderationAndProtection',
        )}
        rules={{ ...requiredRule('projectProgrammeForm.lumoConsiderationAndProtection', t) }}
        tooltip={tooltip('lumoConsiderationAndProtection')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('urbanSpacingPlanningCriteria.natureTypes')}
        rules={{ ...requiredRule('projectProgrammeForm.natureTypes', t) }}
        tooltip={tooltip('natureTypes')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm(
          'urbanSpacingPlanningCriteria.equipmentAndFurnishings',
        )}
        rules={{ ...requiredRule('projectProgrammeForm.equipmentAndFurnishings', t) }}
        tooltip={tooltip('equipmentAndFurnishings')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('urbanSpacingPlanningCriteria.waters')}
        rules={{ ...requiredRule('projectProgrammeForm.waters', t) }}
        tooltip={tooltip('waters')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm(
          'urbanSpacingPlanningCriteria.stormwaterManagement',
        )}
        rules={{ ...requiredRule('projectProgrammeForm.stormwaterManagement', t) }}
        tooltip={tooltip('stormwaterManagement')}
      />
      <ProjectProgrammeLinksField section="urbanSpacingPlanningCriteria" />
    </div>
  );
}

export default memo(UrbanSpacingPlanningCriteriaForm);
