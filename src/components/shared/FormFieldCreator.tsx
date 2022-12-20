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
        const { type, ...formValues } = f;
        const formProps = { ...formValues, key: f.name };
        const formPropsWithSave = { ...formProps, handleSave: handleSave };
        const listName = f.name as ListType;
        switch (type) {
          case FormField.Select:
            return <SelectField {...formPropsWithSave} name={listName} />;
          case FormField.Text:
            return <TextField {...formPropsWithSave} />;
          case FormField.Number:
            return <NumberField {...formPropsWithSave} />;
          case FormField.Title:
            return <FormSectionTitle {...formProps} />;
          case FormField.NetworkNumbers:
            return <NetworkNumbers {...formProps} />;
          case FormField.TagsForm:
            return <HashTagsForm {...formPropsWithSave} />;
          case FormField.FieldSet:
            return <FieldSetCreator key={f.name} form={f} handleSave={handleSave} />;
          case FormField.Date:
            return <DateField {...formPropsWithSave} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default FormFieldCreator;
