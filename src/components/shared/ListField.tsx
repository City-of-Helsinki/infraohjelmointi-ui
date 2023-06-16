import { IForm } from '@/interfaces/formInterfaces';
import { NumberInput } from 'hds-react/components/NumberInput';
import { FC, memo, MouseEvent, useCallback, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormFieldLabel from './FormFieldLabel';

interface IListFieldProps {
  name: string;
  label: string;
  fields?: Array<IForm>;
  readOnly?: boolean;
}

const ListField: FC<IListFieldProps> = ({ name, label, fields, readOnly }) => {
  const [editing, setEditing] = useState(false);
  const { t } = useTranslation();
  const handleSetEditing = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditing((currentState) => !currentState);
  }, []);

  return (
    <div className="input-wrapper" id={name} data-testid={name}>
      <div className="flex flex-col">
        <div style={{ marginBottom: '1rem' }}>
          <FormFieldLabel text={t(label)} onClick={readOnly ? undefined : handleSetEditing} />
        </div>
        {fields?.map((f) => (
          <Controller
            key={f.name}
            name={f.name}
            rules={f.rules}
            control={f.control as Control<FieldValues>}
            render={({ field, fieldState: { error } }) => (
              <div className="list-field-container" key={f.label}>
                <label className="list-field-label">{t(f.label)}</label>
                {!editing ? (
                  <span>{`${field.value} €`}</span>
                ) : (
                  <>
                    <NumberInput
                      className="list-field-input"
                      {...field}
                      label={''}
                      hideLabel={true}
                      id={field.name}
                      readOnly={!editing || f.readOnly}
                      errorText={error?.message}
                    />
                  </>
                )}
              </div>
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(ListField);
