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

function TrafficPlanningCriteriaSection() {
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
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.pedestrianTraffic', t) }}
        tooltip={tooltip('pedestrianTraffic')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.bicycleTraffic')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.bicycleTraffic', t) }}
        tooltip={tooltip('bicycleTraffic')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.serviceAndPickupTraffic')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.serviceAndPickupTraffic', t) }}
        tooltip={tooltip('serviceAndPickupTraffic')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.otherTraffic')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.otherTraffic', t) }}
        tooltip={tooltip('otherTraffic')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.accessibility')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.accessibility', t) }}
        tooltip={tooltip('accessibility')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.noiseManagement')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.noiseManagement', t) }}
        tooltip={tooltip('noiseManagement')}
      />
      <TextAreaField
        {...getFieldPropsForProjectProgrammeForm('trafficPlanningCriteria.winterMaintenance')}
        rules={{ ...requiredTrimmedRule('projectProgrammeForm.winterMaintenance', t) }}
        tooltip={tooltip('winterMaintenance')}
      />
      <ProjectProgrammeLinksField section="trafficPlanningCriteria" />
    </div>
  );
}

export default memo(TrafficPlanningCriteriaSection);
