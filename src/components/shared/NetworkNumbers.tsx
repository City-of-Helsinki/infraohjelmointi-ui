import { HookFormControlType } from '@/interfaces/formInterfaces';
import { FC, forwardRef, memo, Ref, MouseEvent } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import FormFieldLabel from './FormFieldLabel';
import Span from './Span';

interface INetworkNumberContainerProps {
  name: string;
  label: string;
  value: Array<string>;
  readOnly?: boolean;
}
/**
 * We still don't know how this should work when editing,
 * so this doesn't have its own generic form-component yet.
 */
const NetworkNumbersContainer: FC<INetworkNumberContainerProps> = forwardRef(
  ({ name, value, label, readOnly }, ref: Ref<HTMLDivElement>) => {
    // We're still uncertain if these will come as a list or as a single value
    const networkNumbers: Array<{ label: string; value: string }> = Array.isArray(value)
      ? value.map((v) => ({
          label: 'TEST',
          value: v,
        }))
      : [{ label: 'TEST', value: value }];

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      console.log('click: ');
    };

    return (
      <div className="input-wrapper" id={name} data-testid={name} ref={ref}>
        <div className="display-flex-col">
          <FormFieldLabel text={label} onClick={readOnly ? undefined : handleClick} />
          {networkNumbers.length > 0 &&
            networkNumbers.map((nn) => (
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

interface INetworkNumberProps {
  name: string;
  label: string;
  control: HookFormControlType;
  readOnly?: boolean;
}

const NetworkNumbers: FC<INetworkNumberProps> = ({ name, label, control, readOnly }) => {
  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field, fieldState }) => (
        <NetworkNumbersContainer {...field} {...fieldState} label={label} readOnly={readOnly} />
      )}
    />
  );
};

NetworkNumbersContainer.displayName = 'NetworkNumbersContainer';

export default memo(NetworkNumbers);
