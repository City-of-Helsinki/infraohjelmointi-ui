// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { memo, useEffect } from 'react';
import PlanningRow from './PlanningRow/PlanningRow';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import { useAppSelector } from '@/hooks/common';
import { selectPlanningMode, selectPlanningRows } from '@/reducers/planningSlice';
import './styles.css';
import { HoverTooltip } from './PlanningRow/HoverTooltip';
import { getProjectSapCosts } from '@/reducers/sapCostSlice';

const PlanningTable = () => {
  const rows = useAppSelector(selectPlanningRows);
  const mode = useAppSelector(selectPlanningMode);
  const projetSapCosts = useAppSelector(getProjectSapCosts);

  // Single listener instead of one per project row: deactivate project rows when clicking outside of them
  useEffect(() => {
    const handleClickOutside = ({ target }: MouseEvent) => {
      document.querySelectorAll('.project-row.active').forEach((row) => {
        if (!row.contains(target as Node)) {
          row.classList.remove('active');
        }
      });
    };
    document.addEventListener('mouseup', handleClickOutside);
    document.addEventListener('contextmenu', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="planning-table-container" id="planning-table-container">
        <table className={`planning-table ${mode}`} cellSpacing={0} data-testid="planning-table">
          <tbody>
            {/* Rows have a dynamic length, the PlanningRow component renders itself recursively */}
            {rows.map((row: IPlanningRow) => (
              <PlanningRow {...row} sapCosts={projetSapCosts} />
            ))}
          </tbody>
        </table>
      </div>
      <HoverTooltip />
    </>
  );
};

export default memo(PlanningTable);
