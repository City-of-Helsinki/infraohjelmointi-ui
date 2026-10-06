import { pdf } from '@react-pdf/renderer';
import '@/components/Report/pdfFonts';
import ProjectProgrammePdfDocument from './ProjectProgrammePdfDocument';
import { IProjectProgrammePdfDocumentProps } from '@/interfaces/projectProgrammeInterfaces';

export function createProjectProgrammePdfBlob(props: IProjectProgrammePdfDocumentProps) {
  return pdf(<ProjectProgrammePdfDocument {...props} />).toBlob();
}
