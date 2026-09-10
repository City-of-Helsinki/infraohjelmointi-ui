import { memo } from 'react';
import { FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormSectionTitle } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { useProjectProgrammeTooltip } from '@/hooks/useProjectProgrammeTooltip';
import type { IProjectProgrammeForm } from '@/interfaces/projectProgrammeInterfaces';
import {
  getFieldPropsForProjectProgrammeForm,
  requiredTrimmedRule,
} from '@/utils/projectProgrammeUtils';
import ProjectProgrammeLinksField from './ProjectProgrammeLinksField';
import { ProjectProgrammeSectionId } from './projectProgrammeSections';

interface IProjectProgrammeTextAreaFieldsSectionProps {
  section: ProjectProgrammeSectionId;
  titleName: string;
  titleLabel: string;
  testId: string;
  fields: readonly ({ field: string; required?: boolean } | string)[];
}

// Shared layout for project-programme sub-form sections made up of required text-area fields.
function ProjectProgrammeTextAreaFieldsSection({
  section,
  titleName,
  titleLabel,
  testId,
  fields,
}: Readonly<IProjectProgrammeTextAreaFieldsSectionProps>) {
  const { t } = useTranslation();
  const tooltip = useProjectProgrammeTooltip();

  return (
    <div className="mb-12" data-testid={testId}>
      <FormSectionTitle name={titleName} label={titleLabel} />
      <p className="mb-8">{t('projectProgrammeForm.requiredSectionHelperText')}</p>
      {fields.map((field) => {
        const fieldName = typeof field === 'string' ? field : field.field;
        const isRequired = typeof field === 'string' ? true : field.required ?? true;

        return (
          <TextAreaField
            key={fieldName}
            {...getFieldPropsForProjectProgrammeForm(
              `${section}.${fieldName}` as FieldPath<IProjectProgrammeForm>,
            )}
            rules={{
              ...(isRequired ? requiredTrimmedRule(`projectProgrammeForm.${fieldName}`, t) : {}),
            }}
            tooltip={tooltip(fieldName)}
          />
        );
      })}
      <ProjectProgrammeLinksField section={section} />
    </div>
  );
}

export default memo(ProjectProgrammeTextAreaFieldsSection);
