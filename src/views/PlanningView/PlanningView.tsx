import { FC, useCallback, useState } from 'react';
import { PlanningToolbar } from '@/components/Planning/PlanningToolbar';
import { PlanningInfoPanel } from '@/components/Planning/PlanningInfoPanel';
import { PlanningBreadcrumbs } from '@/components/Planning/PlanningBreadcrumbs';
import { PlanningSummaryTable } from '@/components/Planning/PlanningSummaryTable';
import { PlanningTable } from '@/components/Planning/PlanningTable';
import usePlanningRows from '@/hooks/usePlanningRows';
import './styles.css';

const PlanningView: FC = () => {
  const { rows, selections, year, lists, projectToUpdate } = usePlanningRows();

  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Sets the selectedYear or null if the year is given again, so that the monthly view can be closed
  // when the same year is re-clicked
  const handleSetSelectedYear = (year: number | null) =>
    setSelectedYear(year === selectedYear ? null : year);
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
          <PlanningSummaryTable
            startYear={year}
            selections={selections}
            lists={lists}
            handleSetSelectedYear={handleSetSelectedYear}
            selectedYear={selectedYear}
          />
        </div>
        {rows.length > 0 && (
          <PlanningTable
            rows={rows}
            projectToUpdate={projectToUpdate}
            selectedYear={selectedYear}
            groupsExpanded={groupsExpanded}
          />
        )}
      </div>
    </>
  );
};

export default PlanningView;
