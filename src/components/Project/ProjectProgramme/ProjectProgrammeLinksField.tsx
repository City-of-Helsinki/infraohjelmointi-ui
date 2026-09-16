import { memo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, IconPlus, Link } from 'hds-react';
import { TextField } from '@/components/shared';
import type { IProjectProgrammeForm } from '@/interfaces/projectProgrammeInterfaces';
import { ProjectProgrammeSectionId } from './projectProgrammeSections';
import { FormMode } from '@/interfaces/formInterfaces';

interface IProjectProgrammeLinksFieldProps {
  section: ProjectProgrammeSectionId;
  mode?: FormMode;
}

function ProjectProgrammeLinksField({
  section,
  mode = 'edit',
}: Readonly<IProjectProgrammeLinksFieldProps>) {
  const { t } = useTranslation();
  const { control } = useFormContext<IProjectProgrammeForm>();
  const { fields, append } = useFieldArray({
    control,
    name: `${section}.links`,
    keyName: 'formId',
  });
  const linksWithValue = fields.filter((field) => field.value);

  if (linksWithValue.length === 0 && mode === 'view') {
    return null;
  }

  return (
    <>
      <div className="input-wrapper" id="projectProgrammeLinksTitle">
        <h4 className="text-heading-s">{t('projectProgrammeForm.links')}</h4>
      </div>
      {fields.map((field, index) => {
        if (mode === 'view') {
          return field.value ? (
            <Link key={field.formId} href={field.value} external openInNewTab>
              {field.value}
            </Link>
          ) : null;
        }

        return (
          <TextField
            key={field.formId}
            name={`${section}.links.${index}.value`}
            label={`${t('projectProgrammeForm.linkLabel')} ${index + 1}`}
            size="full"
          />
        );
      })}
      {mode === 'edit' && (
        <div className="input-wrapper" id="projectProgrammeAddLinkButton">
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            iconStart={<IconPlus />}
            onClick={() => append({ value: '' })}
          >
            {t('projectProgrammeForm.addNewLink')}
          </Button>
        </div>
      )}
    </>
  );
}

export default memo(ProjectProgrammeLinksField);
