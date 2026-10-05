import { TFunction } from 'i18next';
import { IProject } from '@/interfaces/projectInterfaces';
import { IProjectProgrammeLinkFormItem } from '@/interfaces/projectProgrammeInterfaces';

export const EMPTY_PDF_VALUE = '-';

export interface IProjectProgrammePdfDetail {
  label: string;
  value: string;
}

// Placeholder for adding other project fields like project number, phase etc to pdf in the future.
// They will be added to the "Hankkeen tiedot" block of the PDF.
export const PROJECT_PDF_FIELDS: ReadonlyArray<{
  labelKey: string;
  getValue: (_project: IProject) => unknown;
}> = [];

export function formatPdfValue(value: unknown): string {
  if (value === null || value === undefined) {
    return EMPTY_PDF_VALUE;
  }
  if (typeof value === 'string') {
    return value.trim() || EMPTY_PDF_VALUE;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'object' && 'name' in value) {
    return formatPdfValue((value as { name?: unknown }).name);
  }
  return EMPTY_PDF_VALUE;
}

export function getProjectPdfDetails(
  project: IProject | undefined,
  t: TFunction,
): IProjectProgrammePdfDetail[] {
  if (!project) {
    return [];
  }
  return PROJECT_PDF_FIELDS.map(({ labelKey, getValue }) => ({
    label: t(labelKey),
    value: formatPdfValue(getValue(project)),
  }));
}

export function getPdfLinks(links?: IProjectProgrammeLinkFormItem[] | null): string[] {
  return (links ?? [])
    .map((link) => link.value?.trim())
    .filter((value): value is string => !!value);
}

export function isSafeHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function getProjectProgrammePdfFileName(
  baseName: string,
  projectName: string | null | undefined,
  date: string,
): string {
  const parts = [baseName, projectName?.trim(), date].filter(Boolean) as string[];
  const safeName = parts
    .join('_')
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_');
  return `${safeName}.pdf`;
}
