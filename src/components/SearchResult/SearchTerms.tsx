import { useAppSelector } from '@/hooks/common';
import { FreeSearchFormObject, IOption } from '@/interfaces/common';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { selectFreeSearchParams, selectSearchForm } from '@/reducers/searchSlice';
import { Tag } from 'hds-react/components/Tag';
import { useEffect, useState } from 'react';
import './styles.css';

// Build a search parameter with all the choices from the search form
const getSearchTerms = (form: ISearchForm, freeSearchParams: FreeSearchFormObject | null) => {
  const searchTerms = [];
  for (const [key, value] of Object.entries(form)) {
    switch (key) {
      case 'masterClass':
      case 'class':
      case 'subClass':
      case 'district':
      case 'division':
      case 'subDivision':
        value.forEach((v: IOption) => searchTerms.push(v.label));
        break;
      case 'programmedYes':
        value && searchTerms.push('programmed=true');
        break;
      case 'programmedNo':
        value && searchTerms.push('programmed=false');
        break;
      case 'programmedYearMin':
      case 'programmedYearMax':
      case 'phase':
      case 'personPlanning':
      case 'category':
        value.value && searchTerms.push(value.label);
        break;
      default:
        break;
    }
  }

  if (freeSearchParams) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, value] of Object.entries(freeSearchParams)) {
      switch (value.type) {
        case 'group':
        case 'project':
        case 'hashtag':
          searchTerms.push(value.label);
          break;
        default:
          break;
      }
    }
  }

  return searchTerms;
};

const SearchTerms = () => {
  const freeSearchParams = useAppSelector(selectFreeSearchParams);
  const searchForm = useAppSelector(selectSearchForm);
  const [searchTerms, setSearchTerms] = useState<Array<string>>([]);

  useEffect(() => {
    setSearchTerms(getSearchTerms(searchForm, freeSearchParams));
  }, [searchForm, freeSearchParams]);

  return (
    <div className="search-terms-container">
      {/* existing search terms */}

      <div className="search-terms">
        {searchTerms.map((t, i) => (
          <Tag key={`${t}-${i}`} onDelete={() => console.log('delete tag')}>
            {t}
          </Tag>
        ))}
      </div>
      {/* delete all search terms */}
      <div>
        <Tag className="empty-all-btn" onDelete={() => console.log('delete all tags')}>
          Tyhjennä hakuehdot
        </Tag>
      </div>
    </div>
  );
};

export default SearchTerms;
