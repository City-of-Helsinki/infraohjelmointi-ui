import { Document, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import DocumentHeader from '@/components/Report/PdfReports/reportHeaders/DocumentHeader';
import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';
import { ProjectProgrammeSectionId } from '../sections/projectProgrammeSections';
import { getFieldsForSection } from '../sections/projectProgrammeSectionFields';
import { formatPdfValue, getPdfLinks, isSafeHttpUrl } from './projectProgrammePdfUtils';

const BLUE = '#0000bf';
const GREY = '#666666';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'HelsinkiGrotesk',
    fontSize: '10px',
    color: '#1a1a1a',
    paddingTop: '16px',
    paddingBottom: '56px',
    paddingHorizontal: '40px',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '20px',
  },
  draftTag: {
    backgroundColor: '#ffda07',
    paddingVertical: '3px',
    paddingHorizontal: '8px',
    marginRight: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  completeTag: {
    backgroundColor: '#007a64',
    color: 'white',
    paddingVertical: '3px',
    paddingHorizontal: '8px',
    marginRight: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  mutedText: {
    color: GREY,
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: BLUE,
    borderBottom: `2px solid ${BLUE}`,
    paddingBottom: '4px',
    marginBottom: '10px',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridField: {
    width: '50%',
    paddingRight: '12px',
    marginBottom: '8px',
  },
  field: {
    marginBottom: '8px',
  },
  fieldLabel: {
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  fieldValue: {
    lineHeight: 1.4,
  },
  link: {
    color: BLUE,
    marginBottom: '2px',
  },
  footer: {
    position: 'absolute',
    bottom: '20px',
    left: '40px',
    right: '40px',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #cccccc',
    paddingTop: '6px',
    fontSize: '8px',
    color: GREY,
  },
});

// Short basic info fields are laid out in two columns.
const GRID_FIELDS = new Set([
  'projectName',
  'district',
  'projectProgrammeCompiler',
  'personsInvolved',
  'estimatedCosts',
  'inspector',
]);

export interface IProjectProgrammePdfSection {
  id: ProjectProgrammeSectionId;
  label: string;
}

export interface IProjectProgrammePdfDocumentProps {
  projectProgramme: IProjectProgramme;
  sections: IProjectProgrammePdfSection[];
  projectName: string;
  createdDate: string;
}

function PdfField({
  label,
  value,
  grid,
}: Readonly<{ label: string; value: string; grid?: boolean }>) {
  return (
    <View style={grid ? styles.gridField : styles.field} wrap={!grid}>
      <Text style={styles.fieldLabel} minPresenceAhead={20}>
        {label}
      </Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function PdfSectionTitle({ title }: Readonly<{ title: string }>) {
  return (
    <Text style={styles.sectionTitle} minPresenceAhead={60}>
      {title}
    </Text>
  );
}

function ProjectProgrammePdfDocument({
  projectProgramme,
  sections,
  projectName,
  createdDate,
}: Readonly<IProjectProgrammePdfDocumentProps>) {
  const { t } = useTranslation();
  const isBrief = projectProgramme.briefProjectProgramme ?? true;
  const isComplete = projectProgramme.status === 'COMPLETE';
  const title = t(isBrief ? 'projectProgrammeForm.pdfTitleBrief' : 'projectProgrammeForm.pdfTitle');

  function renderSection({ id, label }: IProjectProgrammePdfSection) {
    const sectionData = (projectProgramme[id] ?? {}) as Record<string, unknown>;
    const fields = getFieldsForSection(id, projectProgramme);
    const gridFields = fields.filter((field) => GRID_FIELDS.has(field));
    const fullFields = fields.filter((field) => !GRID_FIELDS.has(field));
    const links = getPdfLinks(projectProgramme[id]?.links);

    const toField = (field: string, grid?: boolean) => (
      <PdfField
        key={field}
        label={t(`projectProgrammeForm.${field}`)}
        value={formatPdfValue(sectionData[field])}
        grid={grid}
      />
    );

    return (
      <View key={id} style={styles.section}>
        <PdfSectionTitle title={label} />
        {gridFields.length > 0 && (
          <View style={styles.gridRow}>{gridFields.map((field) => toField(field, true))}</View>
        )}
        {fullFields.map((field) => toField(field))}
        <View style={styles.field}>
          <Text style={styles.fieldLabel} minPresenceAhead={20}>
            {t('projectProgrammeForm.links')}
          </Text>
          {links.length === 0 && <Text>{formatPdfValue(null)}</Text>}
          {links.map((link, index) =>
            isSafeHttpUrl(link) ? (
              <Link key={`${link}-${index}`} src={link} style={styles.link}>
                {link}
              </Link>
            ) : (
              <Text key={`${link}-${index}`}>{link}</Text>
            ),
          )}
        </View>
      </View>
    );
  }

  return (
    <Document title={`${title} - ${projectName}`}>
      <Page size="A4" style={styles.page}>
        <DocumentHeader title={title} subtitleOne={projectName} date={createdDate} />

        <View style={styles.statusRow}>
          <Text style={isComplete ? styles.completeTag : styles.draftTag}>
            {t(
              isComplete
                ? 'projectProgrammeForm.completeStatus'
                : 'projectProgrammeForm.draftStatus',
            )}
          </Text>
          <Text style={styles.mutedText}>
            {t('projectProgrammeForm.pdfCreated', { date: createdDate })}
          </Text>
        </View>

        {sections.map(renderSection)}

        <View fixed style={styles.footer}>
          <Text>{`${title} - ${projectName}`}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              t('projectProgrammeForm.pdfPage', { pageNumber, totalPages })
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export default ProjectProgrammePdfDocument;
