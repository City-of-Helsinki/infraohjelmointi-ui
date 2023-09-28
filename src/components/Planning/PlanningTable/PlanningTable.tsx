// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { memo, useEffect } from 'react';
import PlanningRow from './PlanningRow/PlanningRow';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { getCoordinatorNotesByProjectThunk, selectPlanningMode, selectPlanningRows } from '@/reducers/planningSlice';
import './styles.css';
import { HoverTooltip } from './PlanningRow/HoverTooltip';
import { getProjectSapCosts } from '@/reducers/sapCostSlice';

const PlanningTable = () => {
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectPlanningRows);
  const mode = useAppSelector(selectPlanningMode);
  const projetSapCosts = useAppSelector(getProjectSapCosts);

  useEffect(() => {
    dispatch(getCoordinatorNotesByProjectThunk());
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
