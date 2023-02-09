import useSearchForm from '@/hooks/useSearchForm';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useCallback } from 'react';
import { FormFieldCreator } from '../shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { setSearchForm, toggleSearch } from '@/reducers/searchSlice';
import FreeSearchForm from './FreeSearchForm';
import { IOption } from '@/interfaces/common';
import { getProjectsWithParamsThunk } from '@/reducers/projectSlice';
import useClassList from '@/hooks/useClassList';
import useLocationList from '@/hooks/useLocationList';
import './styles.css';
import { useTranslation } from 'react-i18next';

const Search = () => {
  const { formMethods, formFields } = useSearchForm();
  const { handleSubmit } = formMethods;
  const { t } = useTranslation();
  const open = useAppSelector((state: RootState) => state.search.open);
  const dispatch = useAppDispatch();

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
    return searchParams.join('&');
  };

  const onSubmit = async (form: ISearchForm) => {
    const searchParams = buildSearchParams(form);
    dispatch(getProjectsWithParamsThunk(searchParams)).then(() => dispatch(setSearchForm(form)));
  };

  const handleClose = useCallback(
    (form: ISearchForm) => {
      dispatch(toggleSearch());
      dispatch(setSearchForm(form));
    },
    [dispatch],
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
      <Dialog.Header id="search-dialog-header" title="Hae projekteja" />
      <Dialog.Content>
        <FreeSearchForm />
        <form className="search-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="search-form-content">
            <FormFieldCreator form={formFields} />
          </div>
        </form>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button onClick={handleSubmit(onSubmit)}>{t('search')}</Button>
        <Button onClick={handleSubmit(handleClose)} variant="secondary">
          {t('cancel')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default Search;
