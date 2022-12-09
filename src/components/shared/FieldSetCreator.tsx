import { IForm } from '@/interfaces/formInterfaces';
import { Fieldset } from 'hds-react/components/Fieldset';
import { FC } from 'react';
import FormFieldCreator from './FormFieldCreator';

interface IFieldSetCreatorProps {
  form: IForm;
}

const FieldSetCreator: FC<IFieldSetCreatorProps> = ({ form }) => {
  return (
    <Fieldset heading={form.label} id={form.name}>
      <FormFieldCreator form={form.fieldSet as Array<IForm>} />
    </Fieldset>
  );
};

export default FieldSetCreator;
