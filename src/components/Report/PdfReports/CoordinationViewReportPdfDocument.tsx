import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { FC, memo, useMemo } from 'react';
import {
  CoordinationViewReportHierarchyType,
  ICoordinationViewReportPdfRow,
} from '@/utils/reportHelpers';
import DocumentHeader from './reportHeaders/DocumentHeader';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'HelsinkiGrotesk',
    fontSize: '8px',
  },
  document: {
    margin: '20px',
  },
  title: {
    fontSize: '12px',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  table: {
    borderTop: '1px solid #808080',
    borderLeft: '1px solid #808080',
  },
  row: {
    flexDirection: 'row',
  },
  rowAlt: {
    flexDirection: 'row',
    backgroundColor: '#efeff0',
  },
  masterClassRow: {
    flexDirection: 'row',
    backgroundColor: '#0000bf',
    color: 'white',
  },
  classRow: {
    flexDirection: 'row',
    backgroundColor: '#0000a3',
    color: 'white',
  },
  subClassRow: {
    flexDirection: 'row',
    backgroundColor: '#00007a',
    color: 'white',
  },
  districtRow: {
    flexDirection: 'row',
    backgroundColor: '#00005e',
    color: 'white',
  },
  groupRow: {
    flexDirection: 'row',
    backgroundColor: '#e8f3fc',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#0000bf',
    color: 'white',
  },
  firstColumn: {
    width: '34%',
    padding: '4px',
    borderRight: '1px solid #808080',
    borderBottom: '1px solid #808080',
  },
  firstColumnClass: {
    width: '34%',
    padding: '4px',
    borderRight: '1px solid #808080',
    borderBottom: '1px solid #808080',
    fontWeight: 'bold',
  },
  firstColumnHeader: {
    width: '34%',
    padding: '4px',
    borderRight: '1px solid #808080',
    borderBottom: '1px solid #808080',
    fontWeight: 'bold',
  },
  emptyState: {
    fontSize: '10px',
  },
});

interface ICoordinationViewReportPdfDocumentProps {
  rows: ICoordinationViewReportPdfRow[];
  title: string;
}

const CoordinationViewReportPdfDocument: FC<ICoordinationViewReportPdfDocumentProps> = ({
  rows,
  title,
}) => {
  const { t } = useTranslation();
  const headers = useMemo(() => Object.keys(rows[0]?.values ?? {}), [rows]);
  const otherColumnWidth = headers.length > 1 ? `${66 / (headers.length - 1)}%` : '66%';
  const currentDate = moment(new Date()).format('D.MM.YYYY');

  const getColumnStyle = (isHeader: boolean) => ({
    width: otherColumnWidth,
    padding: '4px',
    borderRight: '1px solid #808080',
    borderBottom: '1px solid #808080',
    fontWeight: isHeader ? 'bold' : 'normal',
  });

  const getRowStyle = (rowType: CoordinationViewReportHierarchyType, index: number) => {
    switch (rowType) {
      case 'masterClass':
        return styles.masterClassRow;
      case 'class':
        return styles.classRow;
      case 'subClass':
        return styles.subClassRow;
      case 'district':
        return styles.districtRow;
      case 'group':
        return styles.groupRow;
      default:
        return index % 2 ? styles.rowAlt : styles.row;
    }
  };

  const shouldUseClassNameCell = (rowType: CoordinationViewReportHierarchyType) =>
    rowType !== 'project';

  return (
    <Document title={title}>
      <Page orientation="landscape" size="A2" style={styles.page}>
        <View style={styles.document}>
          <DocumentHeader
            title={t('report.coordinationViewReport.title')}
            subtitleOne={title}
            subtitleTwo={currentDate}
          />

          <View style={styles.table}>
            <View fixed style={styles.headerRow}>
              {headers.map((header, headerIndex) => (
                <Text
                  key={header}
                  style={headerIndex === 0 ? styles.firstColumnHeader : getColumnStyle(true)}
                >
                  {header}
                </Text>
              ))}
            </View>

            {rows.map((row, index) => {
              const rowStyle = getRowStyle(row.rowType, index);
              const rowKey = `${row.values[headers[0]] ?? 'row'}-${row.rowType}-${index}`;
              const firstColumnCellStyle = shouldUseClassNameCell(row.rowType)
                ? styles.firstColumnClass
                : styles.firstColumn;

              return (
                <View wrap={false} key={rowKey} style={rowStyle}>
                  {headers.map((header, headerIndex) => (
                    <Text
                      key={`${rowKey}-${header}`}
                      style={headerIndex === 0 ? firstColumnCellStyle : getColumnStyle(false)}
                    >
                      {row.values[header] ?? ''}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default memo(CoordinationViewReportPdfDocument);
