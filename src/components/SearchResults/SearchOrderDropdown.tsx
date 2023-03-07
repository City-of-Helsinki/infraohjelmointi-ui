import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IOption } from '@/interfaces/common';
import { SearchOrder } from '@/interfaces/searchInterfaces';
import {
  getSearchResultsThunk,
  selectLastSearchParams,
  selectSearchOrder,
  setSearchOrder,
} from '@/reducers/searchSlice';
import { Select } from 'hds-react/components/Select';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const SearchOrderDropdown = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const searchOrder = useAppSelector(selectSearchOrder);
  const lastSearchParams = useAppSelector(selectLastSearchParams);

  const orders: Array<IOption> = [
    { value: 'new', label: t('searchOrder.new') },
    { value: 'old', label: t('searchOrder.old') },
    { value: 'project', label: t('searchOrder.project') },
    { value: 'group', label: t('searchOrder.group') },
    { value: 'phase', label: t('searchOrder.phase') },
  ];

  const handleOrderChange = useCallback(
    (value: IOption) => {
      dispatch(setSearchOrder(value.value as SearchOrder));
      return dispatch(getSearchResultsThunk({ params: lastSearchParams }));
    },
    [dispatch, lastSearchParams],
  );

  return (
    <div data-testid="search-order-dropdown">
      <Select
        className="custom-select w-80"
        label={t('order')}
        options={orders}
        defaultValue={orders[orders.findIndex((o) => o.value === searchOrder)]}
        onChange={handleOrderChange}
      />
    </div>
  );
};

export default memo(SearchOrderDropdown);
