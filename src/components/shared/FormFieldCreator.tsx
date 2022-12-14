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
  handleSave?: any;
}

const FormFieldCreator: FC<IFormFieldCreatorProps> = ({ form, handleSave }) => {
  return (
    <>
      {form?.map((f) => {
        const { type, name, ...formProps } = f;
        switch (type) {
          case FormField.Select:
            return <SelectField key={name} name={name as ListType} {...formProps} />;
          case FormField.Text:
            return <TextField key={f.name} name={name} {...formProps} handleSave={handleSave} />;
          case FormField.Number:
            return <NumberField key={name} name={name} {...formProps} />;
          case FormField.Title:
            return <FormSectionTitle key={name} name={name} label={f.label} />;
          case FormField.NetworkNumbers:
            return <NetworkNumbers key={name} name={name} {...formProps} />;
          case FormField.TagsForm:
            return <HashTagsForm key={name} name={name} {...formProps} />;
          case FormField.FieldSet:
            return <FieldSetCreator key={name} form={f} />;
          case FormField.Date:
            return <DateField key={name} name={name} {...formProps} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default FormFieldCreator;
