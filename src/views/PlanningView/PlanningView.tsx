import { FC, useEffect } from 'react';
import { useAppDispatch } from '@/hooks/common';
import {
  getClassesThunk,
  setClasses,
  setMasterClasses,
  setSubClasses,
} from '@/reducers/classSlice';
import './styles.css';
import { PlanningToolbar } from '@/components/Planning/PlanningToolbar';
import { PlanningInfoPanel } from '@/components/Planning/PlanningInfoPanel';
import { PlanningYearsTable } from '@/components/Planning/PlanningYearsTable';
import { PlanningTable } from '@/components/Planning/PlanningTable';

const PlanningView: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getClassesThunk()).then(() => {
      dispatch(setMasterClasses());
      dispatch(setClasses());
      dispatch(setSubClasses());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PlanningToolbar />
      <div className="planning-view-container">
        <div className="display-flex">
          <PlanningInfoPanel />
          <PlanningYearsTable />
        </div>
        <PlanningTable />
      </div>
    </>
  );
};

export default PlanningView;
