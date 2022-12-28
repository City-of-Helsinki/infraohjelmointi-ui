import { IForm } from '@/interfaces/formInterfaces';
import { NumberInput } from 'hds-react/components/NumberInput';
import { FC, memo, MouseEvent, useCallback, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import FormFieldLabel from './FormFieldLabel';

interface IListFieldProps {
  form: IForm;
}

const ListField: FC<IListFieldProps> = ({ form }) => {
  const { label, readOnly, name } = form;
  const [editing, setEditing] = useState(false);

  const handleSetEditing = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditing((currentState) => !currentState);
  }, []);

  return (
    <div className="input-wrapper" id={name} data-testid={name}>
      <div className="display-flex-col">
        <div style={{ marginBottom: '1rem' }}>
          <FormFieldLabel text={label} onClick={readOnly ? undefined : handleSetEditing} />
        </div>
        {form.fieldSet?.map((f) => (
          <Controller
            key={f.name}
            name={f.name}
            control={f.control as Control<FieldValues>}
            render={({ field }) => (
              <div className="list-field-row" key={f.label}>
                <label className="list-field-item-label">{f.label}</label>
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
