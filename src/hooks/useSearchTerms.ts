import { FreeSearchFormObject, IOption } from '@/interfaces/common';
import { ISearchForm } from '@/interfaces/formInterfaces';
import {
  clearSearchState,
  getSearchResultsThunk,
  initialSearchForm,
  selectSubmittedSearchForm,
  setLastSearchParams,
  setSubmittedSearchForm,
} from '@/reducers/searchSlice';
import buildSearchParams from '@/utils/buildSearchParams';
import { TFunction } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from './common';

interface ISearchTerm {
  value: string;
  id: string;
  type: string;
}

/**
 * Build a search param with all the choices from the search form
 *
 * @param form (ISearchForm)
 * @param translate (i18next translate function)
 * @returns a list of ISearchTerm
 */
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
        value.forEach((v: IOption) => {
          const termLabel = translate(`searchTag.${key}`);
          searchTerms.push({
            value: `${termLabel}: ${v.label}`,
            type: key,
            id: v.value,
          });
        });
        break;
      case 'programmedYes':
      case 'programmedNo':
        value &&
          searchTerms.push({ value: translate(`searchTag.${key}`), type: key, id: value.value });
        break;
      case 'programmedYearMin':
      case 'programmedYearMax':
      case 'phase':
      case 'personPlanning':
      case 'personConstruction':
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

/**
 * Takes a ISearchForm and returns an updated ISearchForm, deleting the given search term.
 *
 * @param searchForm (ISearchForm)
 * @param term
 * @returns ISearchForm
 */
const deleteSearchFormValue = (searchForm: ISearchForm, term: ISearchTerm): ISearchForm => {
  const { type, value, id } = term;
  const form = { ...searchForm };
  const removeFreeSearchParam = (value: string, form: FreeSearchFormObject) => {
    const { [value]: _, ...next } = form;
    return next;
  };

  // Could this be refactored? Since the type has to be cast in an if-statement, it would still end up
  // being almost as long
  switch (type) {
    case 'masterClass':
    case 'class':
    case 'subClass':
    case 'district':
    case 'division':
    case 'subDivision':
      form[type] = searchForm[type].filter((v) => v.value !== id);
      break;
    case 'programmedYes':
    case 'programmedNo':
    case 'programmedYearMin':
    case 'programmedYearMax':
    case 'phase':
    case 'personPlanning':
    case 'personConstruction':
    case 'category':
      (form[type] as string | boolean | IOption) = initialSearchForm[type];
      break;
    case 'freeSearchParams':
      form[type] = removeFreeSearchParam(value, form[type] as FreeSearchFormObject);
      break;
  }
  return form;
};

/**
 * Listens to search form in redux and returns all chosen terms that the search is filtered by. Also
 * returns functions for deleting a single search term or all at once. Deleting a term will fetch
 * the results again with updated params.
 *
 * @returns searchTerms, deleteTerm, deleteAllTerms
 */
const useSearchTerms = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const submittedForm = useAppSelector(selectSubmittedSearchForm);
  const [searchTerms, setSearchTerms] = useState<Array<ISearchTerm>>([]);

  const deleteTerm = useCallback(
    async (term: ISearchTerm) => {
      const formAfterDelete = deleteSearchFormValue(submittedForm, term);
      const searchParams = buildSearchParams(formAfterDelete);
      if (searchParams) {
        try {
          await dispatch(getSearchResultsThunk({ params: searchParams }));
          dispatch(setSubmittedSearchForm(formAfterDelete));
          dispatch(setLastSearchParams(searchParams));
        } catch (e) {
          console.log('Error deleting search term: ', e);
        }
      } else {
        dispatch(clearSearchState());
      }
    },
    [dispatch, submittedForm],
  );

  const deleteAllTerms = useCallback(() => {
    dispatch(clearSearchState());
  }, [dispatch]);

  useEffect(() => {
    setSearchTerms(getSearchTerms(submittedForm, t));
  }, [submittedForm]);

  return { searchTerms, deleteTerm, deleteAllTerms };
};

export default useSearchTerms;
