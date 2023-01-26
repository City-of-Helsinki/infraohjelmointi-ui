import useSearchForm from '@/hooks/useSearchForm';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useCallback } from 'react';
import { FormFieldCreator } from '../shared';
import './styles.css';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { setSearchForm, toggleSearch } from '@/reducers/searchSlice';
import NameSearchForm from './NameSearchForm';
import { IOption } from '@/interfaces/common';
import { getProjectsWithParams } from '@/services/projectServices';

const Search = () => {
  const { formMethods, formFields } = useSearchForm();
  const { handleSubmit } = formMethods;
  const open = useAppSelector((state: RootState) => state.search.open);
  const dispatch = useAppDispatch();

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
        case 'category':
          value.value && searchParams.push(`category=${value.value}`);
          break;
        case 'responsiblePerson':
          value && searchParams.push(`responsiblePerson=${value}`);
          break;
        case 'programmedYes':
          value && searchParams.push(`programmed=${value}`);
          break;
        case 'programmedNo':
          !value && searchParams.push(`programmed=${value}`);
          break;
        default:
          break;
      }
    }
    return searchParams.join('&');
  };

  const onSubmit = async (form: ISearchForm) => {
    const searchParams = buildSearchParams(form);
    getProjectsWithParams(searchParams)
      .then(() => {
        console.log('projects fetched');
        dispatch(setSearchForm(form));
      })
      .catch((e) => console.log('error getting projects with params: ', e));
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
      style={{ position: 'absolute', right: '0', minHeight: '100vh' }}
    >
      <Dialog.Header id="search-dialog-header" title="Hae projekteja" />
      <Dialog.Content>
        <NameSearchForm />
        <form className="search-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="search-form-content">
            <FormFieldCreator form={formFields} />
          </div>
        </form>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button onClick={handleSubmit(onSubmit)}>Hae</Button>
        <Button onClick={handleSubmit(handleClose)} variant="secondary">
          Peruuta
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default Search;
