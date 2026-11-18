import { FC } from 'react';
import { DateInput } from 'hds-react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MyWorkloadDateFieldProps } from '@/interfaces/myWorkloadInterfaces';
import { validateMyWorkloadDateOrder } from '@/utils/myWorkloadFormUtils';
import { normalizeMyWorkloadDate } from '@/utils/myWorkloadUtils';
import classes from '../styles.module.css';

const MyWorkloadDateField: FC<MyWorkloadDateFieldProps> = ({
  id,
  label,
  name,
  required,
  control,
  getValues,
  containerRef,
}) => {
  const { t } = useTranslation();

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        validate: (value) => {
          const trimmedValue = value?.trim?.() ?? '';
          if (required && !trimmedValue) {
            return t('myWorkloadView.table.requiredField');
          }
          if (!trimmedValue) {
            return true;
          }
          if (!normalizeMyWorkloadDate(trimmedValue)) {
            return t('myWorkloadView.table.invalidDate');
          }
          return validateMyWorkloadDateOrder(name, trimmedValue, getValues, t);
        },
      }}
      render={({ field, fieldState: { error } }) => (
        <div
          ref={containerRef}
          className={`input-wrapper date-field-wrapper ${classes.editDialogDateField}`}
        >
          <DateInput
            className="input-xl date-input"
            id={id}
            label={label}
            value={field.value ?? ''}
            onChange={field.onChange}
            placeholder=""
            language="fi"
            required={required}
            invalid={Boolean(error)}
            errorText={error?.message}
            initialMonth={new Date()}
          />
        </div>
      )}
    />
  );
};

export default MyWorkloadDateField;
