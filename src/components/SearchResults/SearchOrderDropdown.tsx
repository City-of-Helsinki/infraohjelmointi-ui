import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { SearchOrder } from '@/interfaces/searchInterfaces';
import {
  getSearchResultsThunk,
  selectLastSearchParams,
  selectSearchOrder,
  setSearchOrder,
} from '@/reducers/searchSlice';
import { Option, Select } from 'hds-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const SearchOrderDropdown = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const searchOrder = useAppSelector(selectSearchOrder);
  const lastSearchParams = useAppSelector(selectLastSearchParams);

  const orders: Array<{ value: string; label: string }> = useMemo(
    () => [
      { value: 'new', label: t('searchOrder.new') },
      { value: 'old', label: t('searchOrder.old') },
      { value: 'project', label: t('searchOrder.project') },
      { value: 'group', label: t('searchOrder.group') },
      { value: 'phase', label: t('searchOrder.phase') },
    ],
    [t],
  );

  const orderBy = useMemo(
    () => orders[orders.findIndex((o) => o.value === searchOrder)].value,
    [searchOrder, orders],
  );

  const handleOrderChange = useCallback(
    (_: Option[], clickedOption: Option) => {
      dispatch(setSearchOrder(clickedOption.value as SearchOrder));
      dispatch(getSearchResultsThunk({ params: lastSearchParams }));
    },
    [dispatch, lastSearchParams],
  );

  return (
    <div data-testid="search-order-dropdown">
      <Select
        className="custom-select w-80"
        options={orders}
        value={orderBy}
        onChange={handleOrderChange}
        texts={{ label: t('order') }}
      />
    </div>
  );
};

export default memo(SearchOrderDropdown);
