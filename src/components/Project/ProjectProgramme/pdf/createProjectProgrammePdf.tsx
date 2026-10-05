import { pdf } from '@react-pdf/renderer';
import '@/components/Report/pdfFonts';
import ProjectProgrammePdfDocument, {
  IProjectProgrammePdfDocumentProps,
} from './ProjectProgrammePdfDocument';

export function createProjectProgrammePdfBlob(props: IProjectProgrammePdfDocumentProps) {
  return pdf(<ProjectProgrammePdfDocument {...props} />).toBlob();
}
