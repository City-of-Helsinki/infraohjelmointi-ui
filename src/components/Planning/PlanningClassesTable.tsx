import { useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import _ from 'lodash';
import PlanningClassesTableRow from './PlanningClassesTableRow';

// FIXME: this any will be removed ones we get the actual group model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PlanningClassesTable = () => {
  const masterClasses = useAppSelector((state: RootState) => state.class.masterClasses, _.isEqual);
  const classes = useAppSelector((state: RootState) => state.class.classes, _.isEqual);
  const subClasses = useAppSelector((state: RootState) => state.class.subClasses, _.isEqual);

  return (
    <table className="planning-projects-table" cellSpacing={0}>
      <tbody>
        {/* Master classes */}
        {masterClasses.map((mc) => (
          <PlanningClassesTableRow key={mc.id} projectClass={mc} type="masterClass">
            {/* Classes */}
            {[...classes.filter((c) => c.parent === mc.id)].map((c) => (
              <PlanningClassesTableRow key={c.id} projectClass={c} type="class">
                {/* Sub classes */}
                {[...subClasses.filter((sc) => sc.parent === c.id)].map((sc) => (
                  <PlanningClassesTableRow key={sc.id} projectClass={sc} type="subClass" />
                ))}
              </PlanningClassesTableRow>
            ))}
          </PlanningClassesTableRow>
        ))}
      </tbody>
    </table>
  );
};

export default PlanningClassesTable;
