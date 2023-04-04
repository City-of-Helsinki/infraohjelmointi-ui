import { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { PlanningClassesTable } from '../PlanningClassesTable';
import { PlanningGroupsTable } from '../PlanningGroupsTable';
import './styles.css';
import { IPlanningTableRow } from '@/hooks/usePlanningTableRows';

interface IPlanningProjectsTableProps {
  rows: Array<IPlanningTableRow>;
}

// FIXME: this any will be removed ones we get the actual group model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PlanningProjectsTable: FC<IPlanningProjectsTableProps> = ({ rows }) => {
  const pathname = useLocation().pathname;

  const [isClassView, setIsClassView] = useState(false);

  // Check if there is a need to change between planner / coordinator view
  useEffect(() => {
    if (pathname.includes('planner')) {
      setIsClassView(false);
    } else if (pathname.includes('coordinator')) {
      setIsClassView(true);
    }
  }, [pathname]);

  return <>{isClassView ? <PlanningClassesTable rows={rows} /> : <PlanningGroupsTable />}</>;
};

export default PlanningProjectsTable;
