import { IconSliders } from 'hds-react/icons';
import { Button } from 'hds-react/components/Button';
import './styles.css';

const SearchFilter = () => {
  return (
    <div className="search-filter-container">
      <Button variant="secondary" size="small" iconLeft={<IconSliders />}>
        Rajaa hakua
      </Button>
    </div>
  );
};

export default SearchFilter;
