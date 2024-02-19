import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import ConstructionProgramTableHeader from './ConstructionProgramTableHeader';
import ConstructionProgramTableRow from './ConstructionProgramTableRow';
import { IProject } from '@/interfaces/projectInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { IClassHierarchy } from '@/reducers/classSlice';
import { getReportRows } from '@/utils/reportHelpers';

const styles = StyleSheet.create({
  table: {
    fontSize: '8px',
    marginTop: '20px',
  },
});

interface IConstructionProgramTableProps {
  projects: Array<IProject>;
  divisions: Array<ILocation>;
  classes: IClassHierarchy;
}

const ConstructionProgramTable: FC<IConstructionProgramTableProps> = ({
  projects,
  divisions,
  classes,
}) => {
  const reportRows = getReportRows(projects, classes, divisions, 'constructionProgram');
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
