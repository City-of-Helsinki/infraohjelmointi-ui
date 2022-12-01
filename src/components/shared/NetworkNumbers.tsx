import { HookFormControlType } from '@/interfaces/formInterfaces';
import { FC, forwardRef, MouseEvent, Ref } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import PenAndLabelButton from './PenAndLabelButton';
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
    const networkNumbers: Array<{ label: string; value: string }> = value.map((v) => ({
      label: 'TEST',
      value: v,
    }));

    const addNetworkNumber = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
    };

    return (
      <div className="display-flex-col" id={name} data-testid={name} ref={ref}>
        <PenAndLabelButton text={label} disabled onClick={addNetworkNumber} />
        {networkNumbers.length > 0 &&
          networkNumbers.map((nn) => (
            <div className="nn-row" key={nn.label}>
              <label className="nn-label">{nn.label}</label>
              <Span size="m" text={nn.value} />
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
