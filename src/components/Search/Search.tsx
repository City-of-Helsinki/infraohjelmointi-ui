import useSearchForm from '@/hooks/useSearchForm';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useCallback, useMemo } from 'react';
import { FormFieldCreator } from '../shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { getSearchResultsThunk, setSearchForm, toggleSearch } from '@/reducers/searchSlice';
import { FreeSearchFormItem, IOption } from '@/interfaces/common';
import useClassList from '@/hooks/useClassList';
import useLocationList from '@/hooks/useLocationList';
import { useTranslation } from 'react-i18next';
import FreeSearchForm from './FreeSearchForm';
import './styles.css';

const Search = () => {
  const { formMethods, formFields } = useSearchForm();
  const { handleSubmit } = formMethods;
  const { t } = useTranslation();
  const open = useAppSelector((state: RootState) => state.search.open);
  const dispatch = useAppDispatch();

  const freeSearchParams: { [k: string]: { [k: string]: string } } = useMemo(() => ({}), []);

  useClassList(false);
  useLocationList(false);

  // Build a search parameter with all the choices from the search form
  const buildSearchParams = (form: ISearchForm) => {
    const searchParams = [];
    for (const [key, value] of Object.entries(form)) {
      switch (key) {
        case 'masterClass':
          value.length > 0 &&
            value.forEach((v: IOption) => searchParams.push(`masterClass=${v.value}`));
          break;
        case 'class':
          value.length > 0 && value.forEach((v: IOption) => searchParams.push(`class=${v.value}`));
          break;
        case 'subClass':
          value.length > 0 &&
            value.forEach((v: IOption) => searchParams.push(`subClass=${v.value}`));
          break;
        case 'programmedYes':
          value && searchParams.push(`programmed=${value}`);
          break;
        case 'programmedNo':
          !value && searchParams.push(`programmed=${value}`);
          break;
        case 'programmedYearMin':
          value && searchParams.push(`programmedYearMin=${value}`);
          break;
        case 'programmedYearMax':
          value && searchParams.push(`programmedYearMax=${value}`);
          break;
        case 'phase':
          value.value && searchParams.push(`category=${value.value}`);
          break;
        case 'personPlanning':
          value.value && searchParams.push(`personPlanning=${value.value}`);
          break;
        case 'district':
          value.length > 0 &&
            value.forEach((v: IOption) => searchParams.push(`district=${v.value}`));
          break;
        case 'division':
          value.length > 0 &&
            value.forEach((v: IOption) => searchParams.push(`division=${v.value}`));
          break;
        case 'subDivision':
          value.length > 0 &&
            value.forEach((v: IOption) => searchParams.push(`subDivision=${v.value}`));
          break;
        case 'category':
          value.value && searchParams.push(`category=${value.value}`);
          break;
        default:
          break;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, value] of Object.entries(freeSearchParams)) {
      switch (true) {
        case value.type === 'group':
          searchParams.push(`projectGroup=${value.value}`);
          break;
        case value.type === 'project':
          searchParams.push(`project=${value.value}`);
          break;
        case value.type === 'hashtag':
          searchParams.push(`hashTags=${value.value}`);
          break;
      }
    }

    return searchParams.join('&');
  };

  const onSubmit = async (form: ISearchForm) => {
    const searchParams = buildSearchParams(form);
    dispatch(getSearchResultsThunk(searchParams)).then(() => dispatch(setSearchForm(form)));
  };

  const handleClose = useCallback(
    (form: ISearchForm) => {
      dispatch(toggleSearch());
      dispatch(setSearchForm(form));
    },
    [dispatch],
  );

  const onFreeSearchSelection = useCallback(
    ({ value, label, type }: FreeSearchFormItem) => {
      freeSearchParams[label] = { value, type, label };
    },
    [freeSearchParams],
  );

  const onFreeSearchRemoval = useCallback(
    (item: string) => {
      delete freeSearchParams[item];
    },
    [freeSearchParams],
  );

  return (
    <Dialog
      id="search-dialog"
      aria-labelledby="project-search-dialog"
      aria-describedby="project-search-dialog"
      isOpen={open}
      close={handleSubmit(handleClose)}
      closeButtonLabelText="Close search dialog"
      scrollable
    >
      <Dialog.Header id="search-dialog-header" title={t('searchProjects')} />
      <Dialog.Content>
        <FreeSearchForm
          onFreeSearchSelection={onFreeSearchSelection}
          onFreeSearchRemoval={onFreeSearchRemoval}
        />
        <form
          className="search-form"
          onSubmit={handleSubmit(onSubmit)}
          data-testid="project-search-form"
        >
          <div className="search-form-content">
            <FormFieldCreator form={formFields} />
          </div>
        </form>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button onClick={handleSubmit(onSubmit)} data-testid="search-projects-button">
          {t('search')}
        </Button>
        <Button onClick={handleSubmit(handleClose)} variant="secondary" data-testid="cancel-search">
          {t('cancel')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default Search;
