import { HookFormControlType } from '@/interfaces/formInterfaces';
import { FC, forwardRef, memo, Ref, MouseEvent } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import FormFieldLabel from './FormFieldLabel';
import Span from './Span';

interface IListFieldContainerProps {
  name: string;
  label: string;
  value: Array<string>;
  readOnly?: boolean;
}
/**
 * We still don't know how this should work when editing,
 * so this doesn't have its own generic form-component yet.
 */
const ListFieldContainer: FC<IListFieldContainerProps> = forwardRef(
  ({ name, value, label, readOnly }, ref: Ref<HTMLDivElement>) => {
    // We're still uncertain if these will come as a list or as a single value
    const listItems: Array<{ label: string; value: string }> = Array.isArray(value)
      ? value.map((v) => ({
          label: '',
          value: v,
        }))
      : [{ label: '', value: value }];

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      console.log('click: ');
    };

    return (
      <div className="input-wrapper" id={name} data-testid={name} ref={ref}>
        <div className="display-flex-col">
          <FormFieldLabel text={label} onClick={readOnly ? undefined : handleClick} />
          {listItems.length > 0 &&
            listItems.map((nn) => (
              <div className="nn-row" key={nn.label}>
                <label className="nn-label">{nn.label}</label>
                <Span size="m" text={nn.value} fontWeight="light" />
              </div>
            ))}
        </div>
      </div>
    );
  },
);

interface IListFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  readOnly?: boolean;
}

const ListField: FC<IListFieldProps> = ({ name, label, control, readOnly }) => {
  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field, fieldState }) => (
        <ListFieldContainer {...field} {...fieldState} label={label} readOnly={readOnly} />
      )}
    />
  );
};

ListFieldContainer.displayName = 'ListFieldContainer';

export default memo(ListField);
