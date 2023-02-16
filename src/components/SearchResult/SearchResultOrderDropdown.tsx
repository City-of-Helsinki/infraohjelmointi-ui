import { IOption } from '@/interfaces/common';
import { Select } from 'hds-react/components/Select';

const SearchResultOrderDropdown = () => {
  // Mock data
  const resultOrder: Array<IOption> = [
    { value: '1', label: 'Uusin ensin' },
    { value: '2', label: 'Vanhin ensin' },
    { value: '3', label: 'Hashtag ensin' },
    { value: '4', label: 'Ryhmät ensin' },
  ];
  return (
    <Select
      label="Järjestys"
      placeholder="Placeholder"
      options={resultOrder}
      className="result-order-dropdown "
    />
  );
};

export default SearchResultOrderDropdown;
