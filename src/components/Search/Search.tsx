import useSearchForm from '@/hooks/useSearchForm';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useCallback } from 'react';
import { FormFieldCreator } from '../shared';
import './styles.css';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { toggleSearch } from '@/reducers/searchSlice';
import NameSearchForm from './NameSearchForm';

const Search = () => {
  const { formMethods, formFields } = useSearchForm();
  const { handleSubmit } = formMethods;
  const open = useAppSelector((state: RootState) => state.search.open);
  const dispatch = useAppDispatch();

  const onSubmit = (form: ISearchForm) => {
    console.log('Form: ', form);
  };

  const handleClose = useCallback(() => dispatch(toggleSearch()), [dispatch]);

  return (
    <Dialog
      id="search-dialog"
      aria-labelledby="project-search-dialog"
      aria-describedby="project-search-dialog"
      isOpen={open}
      close={handleClose}
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
        <Button onClick={handleClose} variant="secondary">
          Peruuta
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default Search;
