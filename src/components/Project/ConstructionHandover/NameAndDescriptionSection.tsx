import { FormSectionTitle, SelectField, TextField } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { useOptions } from '@/hooks/useOptions';
import { Tooltip } from 'hds-react';
import { getFieldProps } from './ConstructionHandoverForm';
import { useTranslation } from 'react-i18next';
import { validateRequired } from '@/utils/validation';

export default function NameAndDescriptionSection() {
  const { t } = useTranslation();
  const constructionProcurementMethods = useOptions('constructionProcurementMethods');

  return (
    <div className="mb-12">
      <FormSectionTitle
        name="nameAndDescription"
        label="constructionHandoverForm.nameAndDescription"
      />
      <TextField
        {...getFieldProps('name')}
        size="full"
        rules={{ ...validateRequired('name', t) }}
      />
      <TextAreaField
        {...getFieldProps('description')}
        rules={{ ...validateRequired('description', t) }}
        tooltip={<Tooltip>{t('constructionHandoverForm.descriptionTooltip')}</Tooltip>}
      />
      <SelectField
        {...getFieldProps('constructionProcurementMethod')}
        options={constructionProcurementMethods}
        size="full"
      />
    </div>
  );
}
