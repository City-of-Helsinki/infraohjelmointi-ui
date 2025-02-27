import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IOption } from '@/interfaces/common';
import { SearchOrder } from '@/interfaces/searchInterfaces';
import {
  getSearchResultsThunk,
  selectLastSearchParams,
  selectSearchOrder,
  setSearchOrder,
} from '@/reducers/searchSlice';
import { Select, Option } from 'hds-react/components/Select';
import { memo, useCallback, useMemo } from 'react';
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

  const orderBy = useMemo(
    () => orders[orders.findIndex((o) => o.value === searchOrder)],
    [searchOrder],
  );

  const handleOrderChange = useCallback(
    (selectedOptions: Option[], clickedOption: Option) => {
      dispatch(setSearchOrder(clickedOption.value as SearchOrder));
      dispatch(getSearchResultsThunk({ params: lastSearchParams }));
    },
    [dispatch, lastSearchParams],
  );

  return (
    <div data-testid="search-order-dropdown">
      <Select
        texts={{
          label: t('order') ?? ''
        }}
        className="custom-select w-80"
        options={orders}
        defaultValue={orderBy.value}
        onChange={handleOrderChange}
      />
    </div>
  );
};

export default memo(SearchOrderDropdown);
