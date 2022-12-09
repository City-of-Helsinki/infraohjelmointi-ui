import { ListType } from '@/interfaces/common';
import { FormField, IForm } from '@/interfaces/formInterfaces';
import { FC } from 'react';
import DateField from './DateField';
import FieldSetCreator from './FieldSetCreator';
import FormSectionTitle from './FormSectionTitle';
import HashTagsForm from './HashTagsForm';
import NetworkNumbers from './NetworkNumbers';
import NumberField from './NumberField';
import SelectField from './SelectField';
import TextField from './TextField';

interface IFormFieldCreatorProps {
  form: Array<IForm>;
}

const FormFieldCreator: FC<IFormFieldCreatorProps> = ({ form }) => {
  return (
    <>
      {form?.map((f) => {
        const { type, name, ...formProps } = f;
        switch (type) {
          case FormField.Select:
            return <SelectField key={f.name} name={name as ListType} {...formProps} />;
          case FormField.Text:
            return <TextField key={f.name} name={name} {...formProps} />;
          case FormField.Number:
            return <NumberField key={f.name} name={name} {...formProps} />;
          case FormField.Title:
            return <FormSectionTitle key={f.name} label={f.label} />;
          case FormField.NetworkNumbers:
            return <NetworkNumbers key={f.name} name={f.name} {...formProps} />;
          case FormField.TagsForm:
            return <HashTagsForm key={f.name} name={f.name} {...formProps} />;
          case FormField.FieldSet:
            return <FieldSetCreator key={f.name} form={f} />;
          case FormField.Date:
            return <DateField key={f.name} name={name} {...formProps} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default FormFieldCreator;
