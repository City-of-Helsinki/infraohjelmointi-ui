import useSearchForm from '@/hooks/useSearchForm';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { FormFieldCreator } from '../shared';
import './styles.css';

const Search = () => {
  const { formMethods, formFields } = useSearchForm();
  const { handleSubmit } = formMethods;

  const onSubmit = (form: ISearchForm) => {
    console.log('Form: ', form);
  };

  return (
    <Dialog
      id="terms-dialog"
      aria-labelledby={'123'}
      aria-describedby={'123'}
      isOpen={true}
      scrollable
      style={{ position: 'absolute', right: '0', minHeight: '100vh' }}
    >
      <Dialog.Header id={'234'} title="Hae projekteja" />
      <Dialog.Content>
        <form className="search-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="search-form-content">
            <FormFieldCreator form={formFields} />
          </div>
        </form>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button onClick={close}>Hae</Button>
        <Button onClick={close} variant="secondary">
          Peruuta
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default Search;
