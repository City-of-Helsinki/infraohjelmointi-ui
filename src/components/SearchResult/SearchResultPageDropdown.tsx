import { IOption } from '@/interfaces/common';
import { Select } from 'hds-react/components/Select';

const SearchResultPageDropdown = () => {
  // Mock data
  const resultAmount = 128;
  const pages: Array<IOption> = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '10', value: '10' },
  ];
  return (
    <div className="page-dropdown-container">
      <span>
        <b>{`${resultAmount} `}</b>hakutulosta
      </span>
      <Select label="" defaultValue={pages[0]} options={pages} className="page-dropdown" />
      <span>kpl sivulla</span>
    </div>
  );
};

export default SearchResultPageDropdown;
