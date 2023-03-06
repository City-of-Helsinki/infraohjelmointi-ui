import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IOption } from '@/interfaces/common';
import { SearchLimit } from '@/interfaces/searchInterfaces';
import { getSearchResultsThunk, selectSearchLimit, setSearchLimit } from '@/reducers/searchSlice';
import { Select } from 'hds-react/components/Select';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ISearchResultsLimitDropdownProps {
  resultLength: number;
}

const SearchResultsLimitDropdown: FC<ISearchResultsLimitDropdownProps> = ({ resultLength }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const searchLimit = useAppSelector(selectSearchLimit);

  const limits: Array<IOption> = [
    { label: '10', value: '10' },
    { label: '20', value: '20' },
    { label: '30', value: '30' },
  ];

  const handleLimitChange = useCallback(
    (value: IOption) => {
      dispatch(setSearchLimit(value.value as SearchLimit));
      return dispatch(getSearchResultsThunk({}));
    },
    [dispatch],
  );

  return (
    <div className="page-dropdown-container">
      <span>
        <b>{`${resultLength} `}</b>
        {t('resultsForSearch')}
      </span>
      {resultLength > 0 && (
        <>
          <Select
            label=""
            defaultValue={limits[limits.findIndex((l) => l.value === searchLimit)]}
            options={limits}
            className="page-dropdown"
            onChange={handleLimitChange}
          />
          <span>kpl sivulla</span>
        </>
      )}
    </div>
  );
};

export default SearchResultsLimitDropdown;
