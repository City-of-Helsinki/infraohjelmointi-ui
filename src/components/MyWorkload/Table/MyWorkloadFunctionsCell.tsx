import { FC } from 'react';
import { IconAngleRight } from 'hds-react';
import { MyWorkloadFunctionsCellProps } from '@/interfaces/myWorkloadInterfaces';
import classes from '../styles.module.css';

const MyWorkloadFunctionsCell: FC<MyWorkloadFunctionsCellProps> = ({ row, label, onEdit }) => (
  <button type="button" className={classes.modifyInformationButton} onClick={() => onEdit(row)}>
    <span>{label}</span>
    <IconAngleRight aria-hidden="true" />
  </button>
);

export default MyWorkloadFunctionsCell;
