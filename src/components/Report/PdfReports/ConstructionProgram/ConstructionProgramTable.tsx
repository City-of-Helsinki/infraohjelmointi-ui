import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import ConstructionProgramTableHeader from './ConstructionProgramTableHeader';
import ConstructionProgramTableRow from './ConstructionProgramTableRow';
import { IProject } from '@/interfaces/projectInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { IClassHierarchy } from '@/reducers/classSlice';
import { keurToMillion } from '@/utils/calculations';
import {
  ConstructionProgramTableRowType,
  IConstructionProgramTableRow,
} from '@/interfaces/reportInterfaces';

const styles = StyleSheet.create({
  table: {
    fontSize: '8px',
    marginTop: '20px',
  },
});

/**
 * Gets the division name and removes the number infront of it.
 */
const getDivision = (divisions?: Array<ILocation>, projectLocation?: string) => {
  const division = divisions?.filter((d) => projectLocation && d.id === projectLocation)[0];
  if (division) {
    return division.name.replace(/^\d+\.\s*/, '');
  }
  return '';
};

interface IConstructionProgramTableProps {
  projects: Array<IProject>;
  divisions: Array<ILocation>;
  classes: IClassHierarchy;
}

/**
 * We build report rows "backwards" by checking each projects parent class and iterating classes
 * to create a hierarchy of masterClass, class, subClass and projects.
 *
 * Projects can appear under any of these levels.
 *
 * @param projects
 * @param classes
 * @param divisions
 * @returns
 */
const getReportRows = (
  projects: Array<IProject>,
  classes: IClassHierarchy,
  divisions: Array<ILocation>,
): Array<IConstructionProgramTableRow> => {
  const { allClasses } = classes;

  const initialValues = {
    parent: null,
    location: '',
    costForecast: '',
    startAndEnd: '',
    spentBudget: '',
    budgetProposalCurrentYearPlus0: '',
    budgetProposalCurrentYearPlus1: '',
    budgetProposalCurrentYearPlus2: '',
    projects: [],
    children: [],
    type: 'class' as ConstructionProgramTableRowType,
  };

  const getProjectsForClass = (id: string): Array<IConstructionProgramTableRow> =>
    projects
      .filter((p) => p.projectClass === id)
      .map((p) => ({
        ...initialValues,
        name: p.name,
        id: p.id,
        location: getDivision(divisions, p.projectLocation),
        costForecast: keurToMillion(p.costForecast),
        startAndEnd: `${p.planningStartYear}-${p.constructionEndYear}`,
        spentBudget: keurToMillion(p.spentBudget),
        budgetProposalCurrentYearPlus0: p.finances.budgetProposalCurrentYearPlus0 ?? '',
        budgetProposalCurrentYearPlus1: p.finances.budgetProposalCurrentYearPlus1 ?? '',
        budgetProposalCurrentYearPlus2: p.finances.budgetProposalCurrentYearPlus2 ?? '',
        type: 'project',
      }));

  // Filter all classes that are included in the projects' parent classes
  const classesForProjects: Array<IConstructionProgramTableRow> = allClasses
    .filter((ac) => projects.findIndex((p) => p.projectClass === ac.id) !== -1)
    .map((c) => ({
      ...initialValues,
      name: c.name,
      parent: c.parent,
      id: c.id,
      projects: getProjectsForClass(c.id),
    }));

  // Get the classes parents
  const classParents = allClasses
    .filter((ac) => classesForProjects.findIndex((cfp) => cfp.parent === ac.id) !== -1)
    .map((c) => ({
      ...initialValues,
      id: c.id,
      name: c.name,
      parent: c.parent,
      children: classesForProjects.filter((cfp) => cfp.parent === c.id),
      projects: getProjectsForClass(c.id),
    }));

  // Get the parent classes parents
  const classGrandParents = allClasses
    .filter((ac) => classParents.findIndex((cp) => cp.parent === ac.id) !== -1)
    .map((c) => ({
      ...initialValues,
      id: c.id,
      name: c.name,
      parent: c.parent,
      children: classParents.filter((cp) => cp.parent === c.id),
      projects: getProjectsForClass(c.id),
    }));

  const classesForProjectsWithNoParents = classesForProjects.filter((cfp) => cfp.parent === null);
  const classParentsWithNoParents = classParents.filter((cp) => cp.parent === null);

  // We return all resulting rows that do not have parents as the first level in the array
  return [...classGrandParents, ...classParentsWithNoParents, ...classesForProjectsWithNoParents];
};

const ConstructionProgramTable: FC<IConstructionProgramTableProps> = ({
  projects,
  divisions,
  classes,
}) => {
  const reportRows = getReportRows(projects, classes, divisions);

  return (
    <View>
      <View style={styles.table}>
        <ConstructionProgramTableHeader />
        {reportRows.map((r, i) => (
          <ConstructionProgramTableRow key={i} row={r} depth={0} />
        ))}
      </View>
    </View>
  );
};

export default memo(ConstructionProgramTable);
