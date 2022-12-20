import { FormSubmitEventType, IForm } from '@/interfaces/formInterfaces';
import { Fieldset } from 'hds-react/components/Fieldset';
import { FC } from 'react';
import FormFieldCreator from './FormFieldCreator';

interface IFieldSetCreatorProps {
  form: IForm;
  handleSave: FormSubmitEventType;
}

const FieldSetCreator: FC<IFieldSetCreatorProps> = ({ form, handleSave }) => {
  return (
    <Fieldset heading={form.label} id={form.name}>
      <FormFieldCreator form={form.fieldSet as Array<IForm>} handleSave={handleSave} />
    </Fieldset>
  );
};

export default FieldSetCreator;
