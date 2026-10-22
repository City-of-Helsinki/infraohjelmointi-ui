import { memo } from 'react';
import { FormSectionTitle, SelectField, TextField } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { Tooltip } from 'hds-react';
import { getFieldProps } from './ConstructionHandoverForm';
import { useTranslation } from 'react-i18next';
import { validateRequired } from '@/utils/validation';
import { useFormContext } from 'react-hook-form';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import useConstructionProcurementMethod from '@/hooks/useConstructionProcurementMethod';

interface INameAndDescriptionSectionProps {
  shouldShowProcurementMethod?: boolean;
}

function NameAndDescriptionSection({
  shouldShowProcurementMethod,
}: Readonly<INameAndDescriptionSectionProps>) {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext<IConstructionHandoverForm>();
  const { constructionProcurementMethods, staraProcurementReasons, showStaraProcurementReason } =
    useConstructionProcurementMethod(
      watch,
      setValue,
      'constructionProcurementMethod',
      'staraProcurementReason',
    );

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
      {shouldShowProcurementMethod && (
        <div className="flex gap-4">
          <div className="flex-1">
            <SelectField
              {...getFieldProps('constructionProcurementMethod')}
              options={constructionProcurementMethods}
              size="full"
            />
          </div>
          {showStaraProcurementReason && (
            <div className="flex-1">
              <SelectField
                {...getFieldProps('staraProcurementReason')}
                options={staraProcurementReasons}
                clearable
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(NameAndDescriptionSection);
