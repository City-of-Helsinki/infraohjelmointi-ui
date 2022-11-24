import { MouseEvent } from 'react';
import PenAndLabelButton from './PenAndLabelButton';
import Span from './Span';

/**
 * TODO: this should be its own generic form component.
 * We still don't know how this should work when editing, so this doesn't have its own generic form-component yet.
 */
const NetworkNumbers = ({ name }: { name: string }) => {
  const networkNumbers: Array<{ label: string; value: string }> = [];

  const addNetworkNumber = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <div className="display-flex-col" id={name}>
      <PenAndLabelButton text="Verkkonumerot" disabled onClick={(e) => addNetworkNumber(e)} />
      {networkNumbers.length > 0 &&
        networkNumbers.map((nn) => (
          <div className="nn-row" key={nn.label}>
            <label className="nn-label">{nn.label}</label>
            <Span size="m" text={nn.value} />
          </div>
        ))}
    </div>
  );
};

export default NetworkNumbers;
