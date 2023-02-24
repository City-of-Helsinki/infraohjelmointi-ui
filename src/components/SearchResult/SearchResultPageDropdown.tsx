import { IOption } from '@/interfaces/common';
import { Select } from 'hds-react/components/Select';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface ISearchResultPageDropdownProps {
  resultLength: number;
}

const SearchResultPageDropdown: FC<ISearchResultPageDropdownProps> = ({ resultLength }) => {
  const { t } = useTranslation();
  const pages: Array<IOption> = [
    { label: '10', value: '10' },
    { label: '20', value: '20' },
    { label: '30', value: '30' },
  ];
  return (
    <div className="page-dropdown-container">
      <span>
        <b>{`${resultLength} `}</b>
        {t('resultsForSearch')}
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
