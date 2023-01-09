import { FC, useEffect } from 'react';
// import { PlanningTable, PlanningToolbar } from '@/components/Planning';
import { useAppDispatch } from '@/hooks/common';
import {
  getClassesThunk,
  setClasses,
  setMasterClasses,
  setSubClasses,
} from '@/reducers/classSlice';
import './styles.css';
import PlanningToolbar from '@/components/Planning/PlanningToolbar';
import PlanningTable from '@/components/Planning/PlanningTable';

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
      <PlanningTable />
    </>
  );
};

export default PlanningView;
