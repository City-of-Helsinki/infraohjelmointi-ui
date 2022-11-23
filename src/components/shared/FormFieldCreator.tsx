import { FormField, IForm } from '@/interfaces/formInterfaces';
import { FC } from 'react';
import SelectField from './SelectField';
import TextField from './TextField';

interface IFormFieldCreatorProps {
  form: Array<IForm>;
}

const FormFieldCreator: FC<IFormFieldCreatorProps> = ({ form }) => {
  return (
    <>
      {form.map((f, i: number) => {
        const { type, options, ...formProps } = f;
        switch (type) {
          case FormField.Select:
            return <SelectField key={i} options={options} {...formProps} />;
          case FormField.Text:
            return <TextField key={i} {...formProps} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default FormFieldCreator;
