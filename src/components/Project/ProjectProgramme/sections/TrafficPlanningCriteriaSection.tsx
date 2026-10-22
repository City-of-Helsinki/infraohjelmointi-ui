import { memo } from 'react';
import ProjectProgrammeTextAreaFieldsSection from '../ProjectProgrammeTextAreaFieldsSection';

export const TRAFFIC_PLANNING_CRITERIA_FIELDS = [
  { field: 'targetTrafficChanges' },
  { field: 'pedestrianTraffic' },
  { field: 'bicycleTraffic' },
  { field: 'carTraffic' },
  { field: 'serviceAndPickupTraffic' },
  { field: 'otherTraffic' },
  { field: 'accessibility' },
  { field: 'noiseManagement' },
  { field: 'winterMaintenance' },
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
