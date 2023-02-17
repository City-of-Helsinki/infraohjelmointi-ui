import { IOption } from '@/interfaces/common';
import { Select } from 'hds-react/components/Select';
import { FC } from 'react';

interface ISearchResultPageDropdownProps {
  resultLength: number;
}
const SearchResultPageDropdown: FC<ISearchResultPageDropdownProps> = ({ resultLength }) => {
  const pages: Array<IOption> = [
    { label: '10', value: '1' },
    { label: '15', value: '2' },
    { label: '20', value: '3' },
    { label: '25', value: '4' },
    { label: '30', value: '5' },
    { label: '35', value: '6' },
    { label: '40', value: '7' },
  ];
  return (
    <div className="page-dropdown-container">
      <span>
        <b>{`${resultLength} `}</b>hakutulosta
      </span>
      {resultLength > 0 && (
        <>
          <Select label="" defaultValue={pages[0]} options={pages} className="page-dropdown" />
          <span>kpl sivulla</span>
        </>
      )}
    </div>
  );
};

export default SearchResultPageDropdown;
