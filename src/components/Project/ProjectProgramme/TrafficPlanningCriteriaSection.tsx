import { memo } from 'react';
import ProjectProgrammeTextAreaFieldsSection from './ProjectProgrammeTextAreaFieldsSection';

const TRAFFIC_PLANNING_CRITERIA_FIELDS = [
  'pedestrianTraffic',
  'bicycleTraffic',
  'serviceAndPickupTraffic',
  'otherTraffic',
  'accessibility',
  'noiseManagement',
  'winterMaintenance',
] as const;

function TrafficPlanningCriteriaSection() {
  return (
    <ProjectProgrammeTextAreaFieldsSection
      section="trafficPlanningCriteria"
      titleName="projectProgrammeTrafficPlanningCriteria"
      titleLabel="projectProgrammeForm.trafficPlanningCriteriaSectionTitle"
      testId="project-programme-traffic-planning-criteria-form"
      fields={TRAFFIC_PLANNING_CRITERIA_FIELDS}
    />
  );
}


export default memo(TrafficPlanningCriteriaSection);
