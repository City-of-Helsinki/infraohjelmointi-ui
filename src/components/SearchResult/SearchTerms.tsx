import { useAppSelector } from '@/hooks/common';
import { FreeSearchFormObject, IOption } from '@/interfaces/common';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { selectSearchForm } from '@/reducers/searchSlice';
import { Tag } from 'hds-react/components/Tag';
import { useEffect, useState } from 'react';
import './styles.css';

// Build a search parameter with all the choices from the search form
const getSearchTerms = (form: ISearchForm) => {
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
        value && searchTerms.push('Ohjelmoitu: kyllä');
        break;
      case 'programmedNo':
        value && searchTerms.push('Ohjelmoitu: ei');
        break;
      case 'programmedYearMin':
        value.value && searchTerms.push(`Ohjelmoitu vuosi max: ${value.label}`);
        break;
      case 'programmedYearMax':
        value.value && searchTerms.push(`Ohjelmoitu vuosi min: ${value.label}`);
        break;
      case 'phase':
      case 'personPlanning':
      case 'category':
        value.value && searchTerms.push(value.label);
        break;
      case 'freeSearchParams':
        for (const [_, v] of Object.entries(value as FreeSearchFormObject)) {
          switch (v.type) {
            case 'groups':
            case 'projects':
            case 'hashtags':
              searchTerms.push(v.label);
              break;
            default:
              break;
          }
        }
        break;
      default:
        break;
    }
  }
  return searchTerms;
};

const SearchTerms = () => {
  const searchForm = useAppSelector(selectSearchForm);
  const [searchTerms, setSearchTerms] = useState<Array<string>>([]);

  useEffect(() => {
    setSearchTerms(getSearchTerms(searchForm));
  }, [searchForm]);

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
