import { IOption } from '@/interfaces/common';
import { Select } from 'hds-react/components/Select';
import { useTranslation } from 'react-i18next';

const SearchResultsOrderDropdown = () => {
  const { t } = useTranslation();

  const order: Array<IOption> = [
    { value: '1', label: t('searchOrder.new') },
    { value: '2', label: t('searchOrder.old') },
    { value: '3', label: t('searchOrder.project') },
    { value: '4', label: t('searchOrder.group') },
  ];

  return (
    <div data-testid="search-order-dropdown">
      <Select label={t('order')} placeholder="Placeholder" options={order} className="w-80" />
    </div>
  );
};

export default SearchResultsOrderDropdown;
