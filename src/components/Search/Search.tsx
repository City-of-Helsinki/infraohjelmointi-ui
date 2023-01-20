import useSearchForm from '@/hooks/useSearchForm';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { Button } from 'hds-react/components/Button';
import { IconCross } from 'hds-react/icons';
import { FormFieldCreator, Title } from '../shared';
import './styles.css';

const Search = () => {
  const { formMethods, formFields } = useSearchForm();
  const { handleSubmit } = formMethods;

  const onSubmit = (form: ISearchForm) => {
    console.log('Form: ', form);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit(onSubmit)}>
      {/* Header */}
      <div className="search-form-header">
        <Title size="s" text="Hae projekteja" />
        <IconCross />
      </div>
      {/* Form */}
      <div className="search-form-content">
        <FormFieldCreator form={formFields} />
      </div>
      {/* Buttons */}
      <div className="search-form-content">
        <Button type="submit">Hae</Button>
        <Button variant="secondary">Peruuta</Button>
      </div>
    </form>
  );
};

export default Search;
