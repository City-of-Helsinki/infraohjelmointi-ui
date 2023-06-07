import { FC, useCallback, useState } from 'react';
import { PlanningToolbar } from '@/components/Planning/PlanningToolbar';
import { PlanningInfoPanel } from '@/components/Planning/PlanningInfoPanel';
import { PlanningBreadcrumbs } from '@/components/Planning/PlanningBreadcrumbs';
import { PlanningSummaryTable } from '@/components/Planning/PlanningSummaryTable';
import { PlanningTable } from '@/components/Planning/PlanningTable';
import usePlanningRows from '@/hooks/usePlanningRows';
import { useAppSelector } from '@/hooks/common';
import {
  selectPlanningRows,
  selectSelectedYear,
  selectSelections,
  selectStartYear,
} from '@/reducers/planningSlice';
import './styles.css';

const PlanningView: FC = () => {
  const { lists, projectToUpdate } = usePlanningRows();
  const selectedYear = useAppSelector(selectSelectedYear);
  const rows = useAppSelector(selectPlanningRows);
  const selections = useAppSelector(selectSelections);
  const startYear = useAppSelector(selectStartYear);

  const [groupsExpanded, setGroupsExpanded] = useState<boolean>(false);

  const toggleGroupsExpanded = useCallback(function () {
    setGroupsExpanded((current) => !current);
  }, []);

  return (
    <>
      <PlanningBreadcrumbs selections={selections} />
      <PlanningToolbar
        selections={selections}
        toggleGroupsExpanded={toggleGroupsExpanded}
        groupsExpanded={groupsExpanded}
      />
      <div className={`planning-view-container ${selectedYear ? '!mr-20' : ''}`} id="planning-view">
        <div className="mb-2 flex">
          <PlanningInfoPanel selectedMasterClass={selections.selectedMasterClass} />
          <PlanningSummaryTable startYear={startYear} selections={selections} lists={lists} />
        </div>
        {rows.length > 0 && (
          <PlanningTable
            rows={rows}
            projectToUpdate={projectToUpdate}
            groupsExpanded={groupsExpanded}
          />
        )}
      </div>
    </>
  );
};

export default PlanningView;
