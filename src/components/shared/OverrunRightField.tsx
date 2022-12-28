import { IForm } from '@/interfaces/formInterfaces';
import { NumberInput } from 'hds-react/components/NumberInput';
import { useState, MouseEvent } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import BubbleIcon from './BubbleIcon';
import FormFieldLabel from './FormFieldLabel';

const OverrunRightField = ({ form }: { form: IForm }) => {
  const [editing, setEditing] = useState(false);
  const { t } = useTranslation();
  const handleSetEditing = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditing(!editing);
  };

  return (
    <div className="input-wrapper" id="overrunRight">
      <Controller
        name="budgetOverrunYear"
        control={form.control as Control<FieldValues>}
        render={({ field }) => (
          <>
            <div className="overrun-label-container">
              <FormFieldLabel
                text={t('overrunRightValue', { value: field.value })}
                onClick={handleSetEditing}
              />
            </div>
            {editing && (
              <>
                {/* edit */}
                <FormFieldLabel text={t(field.name)} />
                <NumberInput
                  className="list-field-input"
                  {...field}
                  label={''}
                  id={field.name}
                  readOnly={!editing || form.readOnly}
                />
              </>
            )}
          </>
        )}
      />
      <Controller
        name="budgetOverrunAmount"
        control={form.control as Control<FieldValues>}
        render={({ field }) => (
          <>
            {editing ? (
              <>
                {/* edit */}
                <FormFieldLabel text={t(field.name)} />
                <NumberInput
                  className="list-field-input"
                  {...field}
                  label={''}
                  id={field.name}
                  readOnly={!editing || form.readOnly}
                />
              </>
            ) : (
              <div className="flex-row-center">
                {/* display */}
                <BubbleIcon value={'y'} />
                <span className="overrun-amount-container">{`${field.value} keur`}</span>
              </div>
            )}
          </>
        )}
      />
    </div>
  );
};

export default OverrunRightField;
