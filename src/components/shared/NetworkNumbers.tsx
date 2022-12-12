import { HookFormControlType } from '@/interfaces/formInterfaces';
import { FC, forwardRef, Ref } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import FormFieldLabel from './FormFieldLabel';
import Span from './Span';

interface INetworkNumberContainerProps {
  name: string;
  label: string;
  value: Array<string>;
}
/**
 * We still don't know how this should work when editing,
 * so this doesn't have its own generic form-component yet.
 */
const NetworkNumbersContainer: FC<INetworkNumberContainerProps> = forwardRef(
  ({ name, value, label }, ref: Ref<HTMLDivElement>) => {
    // We're still uncertain if these will come as a list or as a single value
    const networkNumbers: Array<{ label: string; value: string }> = Array.isArray(value)
      ? value.map((v) => ({
          label: 'TEST',
          value: v,
        }))
      : [{ label: 'TEST', value: value }];

    return (
      <div className="display-flex-col" id={name} data-testid={name} ref={ref}>
        <FormFieldLabel text={label} />
        {networkNumbers.length > 0 &&
          networkNumbers.map((nn) => (
            <div className="nn-row" key={nn.label}>
              <label className="nn-label">{nn.label}</label>
              <Span size="m" text={nn.value} fontWeight="light" />
            </div>
          ))}
      </div>
    );
  },
);

interface INetworkNumberProps {
  name: string;
  label: string;
  control: HookFormControlType;
}

const NetworkNumbers: FC<INetworkNumberProps> = ({ name, label, control }) => {
  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field, fieldState }) => (
        <NetworkNumbersContainer {...field} {...fieldState} label={label} />
      )}
    />
  );
};

NetworkNumbersContainer.displayName = 'NetworkNumbersContainer';

export default NetworkNumbers;
