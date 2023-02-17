import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { FreeSearchFormObject, IOption } from '@/interfaces/common';
import { ISearchForm } from '@/interfaces/formInterfaces';
import {
  clearSearchForm,
  initialSearchState,
  selectSearchForm,
  setSearchForm,
} from '@/reducers/searchSlice';
import { Tag } from 'hds-react/components/Tag';
import { TFunction } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';

// Build a search parameter with all the choices from the search form
const getSearchTerms = (
  form: ISearchForm,
  translate: TFunction<'translation', undefined>,
): Array<ISearchTerm> => {
  const searchTerms = [];
  for (const [key, value] of Object.entries(form)) {
    switch (key) {
      case 'masterClass':
      case 'class':
      case 'subClass':
      case 'district':
      case 'division':
      case 'subDivision':
        value.forEach((v: IOption) =>
          searchTerms.push({
            value: `${translate(`searchTag.${key}`)}: ${v.label}`,
            type: key,
            id: v.value,
          }),
        );
        break;
      case 'programmedYes':
      case 'programmedNo':
        value &&
          searchTerms.push({ value: translate(`searchTag.${key}`), type: key, id: value.value });
        break;
      case 'programmedYearMin':
      case 'programmedYearMax':
        value.value &&
          searchTerms.push({
            value: translate(`searchTag.${key}`, { label: value.label }),
            type: key,
            id: value.value,
          });
        break;
      case 'phase':
      case 'personPlanning':
      case 'category':
        value.value && searchTerms.push({ value: value.label, type: key, id: value.value });
        break;
      case 'freeSearchParams':
        for (const [_, v] of Object.entries(value as FreeSearchFormObject)) {
          switch (v.type) {
            case 'groups':
            case 'projects':
            case 'hashtags':
              searchTerms.push({ value: v.label, type: key, id: v.value });
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

const deleteSearchFormValue = (searchForm: ISearchForm, term: ISearchTerm) => {
  const { type, value, id } = term;
  const form = { ...searchForm };
  const initialForm = initialSearchState.form;
  const removeFreeSearchParam = (type: string, value: string, form: FreeSearchFormObject) => {
    const { [value]: _, ...next } = form;
    return next;
  };
  switch (type) {
    case 'masterClass':
    case 'class':
    case 'subClass':
    case 'district':
    case 'division':
    case 'subDivision':
      form[type] = [...form[type]];
      delete form[type][searchForm[type].findIndex((v) => v.value === id)];
      break;
    case 'programmedYes':
    case 'programmedNo':
    case 'programmedYearMin':
    case 'programmedYearMax':
    case 'phase':
    case 'personPlanning':
    case 'category':
      (form[type] as string | boolean | IOption) = initialForm[type];
      break;
    case 'freeSearchParams':
      form[type] = removeFreeSearchParam(type, value, form[type] as FreeSearchFormObject);
      break;
  }
  return form;
};

interface ISearchTerm {
  value: string;
  id: string;
  type: string;
}

const SearchTerms = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const searchForm = useAppSelector(selectSearchForm);
  const [searchTerms, setSearchTerms] = useState<Array<ISearchTerm>>([]);

  useEffect(() => {
    setSearchTerms(getSearchTerms(searchForm, t));
  }, [searchForm]);

  const handleDelete = useCallback(
    (term: ISearchTerm) => {
      dispatch(setSearchForm(deleteSearchFormValue(searchForm, term)));
    },
    [dispatch, searchForm],
  );

  const handleDeleteAll = useCallback(() => dispatch(clearSearchForm()), [dispatch]);

  return (
    <div className="search-terms-container">
      {/* existing search terms */}
      <div className="search-terms">
        {searchTerms.map((t) => (
          <Tag key={t.id} onDelete={() => handleDelete(t)}>
            {t.value}
          </Tag>
        ))}
      </div>
      {/* delete all search terms */}
      <div>
        <Tag className="empty-all-btn" onDelete={handleDeleteAll}>
          Tyhjennä hakuehdot
        </Tag>
      </div>
    </div>
  );
};

export default SearchTerms;
