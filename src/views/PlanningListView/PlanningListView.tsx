import { FC } from 'react';
import { PlanningListTable, PlanningListToolbar } from '@/components/PlanningList';
import './styles.css';

const PlanningListView: FC = () => {
  return (
    <>
      <PlanningListToolbar />
      <PlanningListTable />
    </>
  );
};

export default PlanningListView;
