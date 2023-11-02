import { IForm } from '@/interfaces/formInterfaces';
import { NumberInput } from 'hds-react/components/NumberInput';
import { FC, memo, MouseEvent, useCallback, useEffect, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormFieldLabel from './FormFieldLabel';

interface IListFieldProps {
  name: string;
  label: string;
  fields?: Array<IForm>;
  readOnly?: boolean;
  cancelEdit?: boolean;
  disabled?: boolean;
}

const ListField: FC<IListFieldProps> = ({
  name,
  label,
  fields,
  readOnly,
  cancelEdit,
  disabled,
}) => {
  const [editing, setEditing] = useState(false);
  const { t } = useTranslation();

  function getSapCostValue(field: IForm):string {
    let sapValue = 0;

    if (field.name === 'realizedCost') {
      sapValue = field.sapCosts?.project_task_costs || 0;
    }
    else if (field.name === 'comittedCost') {
      sapValue = field.sapCosts?.project_task_commitments || 0;
    }
    else if (field.name === 'spentCost') {
      const realizedCost = field.sapCosts?.project_task_costs || 0;
      const comittedCost = field.sapCosts?.project_task_commitments || 0;
      sapValue = Number(comittedCost) + Number(realizedCost);
    }
    return Number(sapValue).toFixed(0);
  };

  const handleSetEditing = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditing((currentState) => !currentState);
  }, []);

  useEffect(() => {
    if (cancelEdit && editing) {
      setEditing(false);
    }
  }, [cancelEdit]);

  return (
    <div className="input-wrapper" id={name} data-testid={name}>
      <div className="flex flex-col">
        <div style={{ marginBottom: '1rem' }}>
          <FormFieldLabel
            disabled={disabled}
            text={t(label)}
            onClick={readOnly ? undefined : handleSetEditing}
          />
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
                  <span>{f.sapCosts ? `${getSapCostValue(f)} €` : `${field.value} €`}</span>
                ) : (
                  <>
                    <NumberInput
                      disabled={disabled}
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
