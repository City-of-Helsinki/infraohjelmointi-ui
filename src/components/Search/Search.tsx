import useSearchForm from '@/hooks/useSearchForm';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useCallback } from 'react';
import { FormFieldCreator } from '../shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import {
  getSearchResultsThunk,
  selectFreeSearchParams,
  selectOpen,
  setSearchForm,
  toggleSearch,
} from '@/reducers/searchSlice';
import { FreeSearchFormObject, IOption } from '@/interfaces/common';
import useClassList from '@/hooks/useClassList';
import useLocationList from '@/hooks/useLocationList';
import { useTranslation } from 'react-i18next';
import FreeSearchForm from './FreeSearchForm';
import './styles.css';

// Build a search parameter with all the choices from the search form
const buildSearchParams = (form: ISearchForm, freeSearchParams: FreeSearchFormObject | null) => {
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
        value.length > 0 && value.forEach((v: IOption) => searchParams.push(`subClass=${v.value}`));
        break;
      case 'programmedYes':
        value && searchParams.push('programmed=true');
        break;
      case 'programmedNo':
        value && searchParams.push('programmed=false');
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
        value.length > 0 && value.forEach((v: IOption) => searchParams.push(`district=${v.value}`));
        break;
      case 'division':
        value.length > 0 && value.forEach((v: IOption) => searchParams.push(`division=${v.value}`));
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

  if (freeSearchParams) {
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
  }

  return searchParams.join('&');
};

const Search = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectOpen);
  const freeSearchParams = useAppSelector(selectFreeSearchParams);

  const { formMethods, formFields } = useSearchForm();

  const {
    handleSubmit,
    getValues,
    formState: { isDirty },
    reset,
  } = formMethods;

  useClassList(false);
  useLocationList(false);

  const onSubmit = useCallback(
    async (form: ISearchForm) => {
      const searchParams = buildSearchParams(form, freeSearchParams);
      dispatch(getSearchResultsThunk(searchParams)).then(() => {
        dispatch(setSearchForm(form));
        reset(form);
      });
    },
    [dispatch, freeSearchParams, reset],
  );

  const handleClose = useCallback(() => {
    dispatch(toggleSearch());
    dispatch(setSearchForm(getValues()));
  }, [dispatch, getValues]);

  return (
    <Dialog
      id="search-dialog"
      aria-labelledby="project-search-dialog"
      aria-describedby="project-search-dialog"
      isOpen={open}
      close={handleClose}
      closeButtonLabelText="Close search dialog"
      scrollable
    >
      <Dialog.Header id="search-dialog-header" title={t('searchProjects')} />
      <Dialog.Content>
        <FreeSearchForm />
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
        <Button
          onClick={handleSubmit(onSubmit)}
          data-testid="search-projects-button"
          disabled={!isDirty}
        >
          {t('search')}
        </Button>
        <Button onClick={handleClose} variant="secondary" data-testid="cancel-search">
          {t('cancel')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default Search;
