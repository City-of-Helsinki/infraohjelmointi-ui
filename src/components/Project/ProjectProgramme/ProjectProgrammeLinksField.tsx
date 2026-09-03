import { memo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, IconPlus } from 'hds-react';
import { TextField } from '@/components/shared';
import type { IProjectProgrammeForm } from '@/interfaces/projectProgrammeInterfaces';
import { ProjectProgrammeSectionId } from './projectProgrammeSections';

interface IProjectProgrammeLinksFieldProps {
  section: ProjectProgrammeSectionId;
}

function ProjectProgrammeLinksField({ section }: Readonly<IProjectProgrammeLinksFieldProps>) {
  const { t } = useTranslation();
  const { control } = useFormContext<IProjectProgrammeForm>();
  const { fields, append } = useFieldArray({
    control,
    name: `${section}.links`,
    keyName: 'formId',
  });

  return (
    <>
      <div className="input-wrapper" id="projectProgrammeLinksTitle">
        <h4 className="text-heading-s">{t('projectProgrammeForm.links')}</h4>
      </div>
      {fields.map((field, index) => (
        <TextField
          key={field.formId}
          name={`${section}.links.${index}.value`}
          label={`${t('projectProgrammeForm.linkLabel')} ${index + 1}`}
          size="full"
        />
      ))}
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
    </>
  );
}

export default memo(ProjectProgrammeLinksField);
