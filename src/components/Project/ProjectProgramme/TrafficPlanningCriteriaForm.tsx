import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSectionTitle } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { getFieldPropsForProjectProgrammeForm, requiredRule } from '@/utils/projectProgrammeUtils';
import ProjectProgrammeLinksField, {
  useProjectProgrammeTooltip,
} from './ProjectProgrammeLinksField';

function TrafficPlanningCriteriaForm() {
  const { t } = useTranslation();
  const tooltip = useProjectProgrammeTooltip();

  return (
    <div className="mb-12" data-testid="project-programme-traffic-planning-criteria-form">
      <FormSectionTitle
        name="projectProgrammeTrafficPlanningCriteria"
        label="projectProgrammeForm.trafficPlanningCriteriaSectionTitle"
      />
      <p className="mb-8">{t('projectProgrammeForm.requiredSectionHelperText')}</p>
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.pedestrianTraffic')}
        rules={{ ...requiredRule('projectProgrammeForm.pedestrianTraffic', t) }}
        tooltip={tooltip('pedestrianTraffic')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.bicycleTraffic')}
        rules={{ ...requiredRule('projectProgrammeForm.bicycleTraffic', t) }}
        tooltip={tooltip('bicycleTraffic')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.serviceAndPickupTraffic')}
        rules={{ ...requiredRule('projectProgrammeForm.serviceAndPickupTraffic', t) }}
        tooltip={tooltip('serviceAndPickupTraffic')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.otherTraffic')}
        rules={{ ...requiredRule('projectProgrammeForm.otherTraffic', t) }}
        tooltip={tooltip('otherTraffic')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.accessibility')}
        rules={{ ...requiredRule('projectProgrammeForm.accessibility', t) }}
        tooltip={tooltip('accessibility')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.noiseManagement')}
        rules={{ ...requiredRule('projectProgrammeForm.noiseManagement', t) }}
        tooltip={tooltip('noiseManagement')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.winterMaintenance')}
        rules={{ ...requiredRule('projectProgrammeForm.winterMaintenance', t) }}
        tooltip={tooltip('winterMaintenance')}
      />
      <ProjectProgrammeLinksField section="trafficPlanningCriteria" />
    </div>
  );
}

export default memo(TrafficPlanningCriteriaForm);
