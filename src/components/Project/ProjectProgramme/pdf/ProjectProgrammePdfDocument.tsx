import { Document, Link, Page, Text, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import DocumentHeader from '@/components/Report/PdfReports/reportHeaders/DocumentHeader';
import { getFieldsForSection } from '../sections/projectProgrammeSectionFields';
import { formatPdfValue, getPdfLinks, isSafeHttpUrl } from './projectProgrammePdfUtils';
import { styles } from './pdfStyleSheet';
import type {
  IProjectProgrammePdfDocumentProps,
  IProjectProgrammePdfSection,
} from '@/interfaces/projectProgrammeInterfaces';

// Short basic info fields are laid out in two columns.
const GRID_FIELDS = new Set([
  'projectName',
  'district',
  'projectProgrammeCompiler',
  'personsInvolved',
  'estimatedCosts',
  'inspector',
]);

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
