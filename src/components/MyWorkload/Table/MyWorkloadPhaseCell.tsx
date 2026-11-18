import { FC } from 'react';
import { MyWorkloadPhaseCellProps } from '@/interfaces/myWorkloadInterfaces';
import classes from '../styles.module.css';

const phaseClassMap: Record<string, string> = {
  proposal: classes.phasePillProposal,
  design: classes.phasePillDesign,
  programming: classes.phasePillProgramming,
  draftinitiation: classes.phasePillDraftInitiation,
  draftapproval: classes.phasePillDraftApproval,
  constructionplan: classes.phasePillConstructionPlan,
  constructionwait: classes.phasePillConstructionWait,
  construction: classes.phasePillConstruction,
  constructionpreparation: classes.phasePillConstructionPreparation,
  warrantyperiod: classes.phasePillWarranty,
  completed: classes.phasePillCompleted,
  suspended: classes.phasePillSuspended,
};

const MyWorkloadPhaseCell: FC<MyWorkloadPhaseCellProps> = ({ phaseInfo }) => (
  <div className={classes.phaseCellAlignRight}>
    <span
      className={`${classes.phasePill} ${
        phaseClassMap[phaseInfo.value.toLowerCase()] ?? classes.phasePillDefault
      }`}
    >
      {phaseInfo.label}
    </span>
  </div>
);

export default MyWorkloadPhaseCell;
