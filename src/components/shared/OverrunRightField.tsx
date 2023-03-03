import { HookFormControlType } from '@/interfaces/formInterfaces';
import { NumberInput } from 'hds-react/components/NumberInput';
import { useState, MouseEvent, useCallback, memo, FC } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import BubbleIcon from './BubbleIcon';
import FormFieldLabel from './FormFieldLabel';

interface IOverrunRightField {
  control: HookFormControlType;
  readOnly?: boolean;
}
const OverrunRightField: FC<IOverrunRightField> = ({ readOnly, control }) => {
  const [editing, setEditing] = useState(false);
  const { t } = useTranslation();

  const handleSetEditing = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditing((currentState) => !currentState);
  }, []);

  return (
    <div className="input-wrapper" id="overrunRight">
      <Controller
        name="budgetOverrunYear"
        control={control as Control<FieldValues>}
        render={({ field }) => (
          <>
            <div className="mb-3">
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
                  readOnly={!editing || readOnly}
                />
              </>
            )}
          </>
        )}
      />
      <Controller
        name="budgetOverrunAmount"
        control={control as Control<FieldValues>}
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
                  readOnly={!editing || readOnly}
                />
              </>
            ) : (
              <div className="flex items-center">
                {/* display */}
                <BubbleIcon value={'y'} />
                <span className="mr-1">{`${field.value} keur`}</span>
              </div>
            )}
          </>
        )}
      />
    </div>
  );
};

export default memo(OverrunRightField);
