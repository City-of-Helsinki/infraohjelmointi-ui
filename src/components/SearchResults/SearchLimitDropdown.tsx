import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IOption } from '@/interfaces/common';
import { SearchLimit } from '@/interfaces/searchInterfaces';
import {
  getSearchResultsThunk,
  selectLastSearchParams,
  selectSearchLimit,
  setSearchLimit,
} from '@/reducers/searchSlice';
import { Option, Select } from 'hds-react';
import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ISearchLimitDropdownProps {
  resultLength: number;
}

const SearchLimitDropdown: FC<ISearchLimitDropdownProps> = ({ resultLength }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const searchLimit = useAppSelector(selectSearchLimit);
  const lastSearchParams = useAppSelector(selectLastSearchParams);

  const limits: Array<IOption> = [
    { label: '10', value: '10' },
    { label: '20', value: '20' },
    { label: '30', value: '30' },
  ];

  const handleLimitChange = useCallback(
    (_: Option[], clickedOption: Option) => {
      dispatch(setSearchLimit(clickedOption.value as SearchLimit));
      dispatch(getSearchResultsThunk({ params: lastSearchParams }));
    },
    [dispatch, lastSearchParams],
  );

  const selectedLimit = limits[limits.findIndex((limit) => limit.value === searchLimit)].value;

  return (
    <div className="limit-dropdown-container">
      <span>
        <b>{`${resultLength} `}</b>
        {t('resultsForSearch')}
      </span>
      {resultLength > 0 && (
        <>
          <Select
            value={selectedLimit}
            options={limits}
            className="custom-select limit-dropdown"
            onChange={handleLimitChange}
            texts={{ label: '' }}
            style={{ width: '100px' }}
          />
          <span>kpl sivulla</span>
        </>
      )}
    </div>
  );
};

export default memo(SearchLimitDropdown);
