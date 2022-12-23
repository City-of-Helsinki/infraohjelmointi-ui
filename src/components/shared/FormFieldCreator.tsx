import { ListType } from '@/interfaces/common';
import { FormField, IForm } from '@/interfaces/formInterfaces';
import { FC } from 'react';
import DateField from './DateField';
import FieldSetCreator from './FieldSetCreator';
import FormSectionTitle from './FormSectionTitle';
import HashTagsForm from './HashTagsForm';
import ListField from './ListField';
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
        const { type, ...formValues } = f;
        const formProps = { ...formValues, key: f.name };
        const listName = f.name as ListType;
        switch (type) {
          case FormField.Select:
            return <SelectField {...formProps} name={listName} />;
          case FormField.Text:
            return <TextField {...formProps} />;
          case FormField.Number:
            return <NumberField {...formProps} />;
          case FormField.Title:
            return <FormSectionTitle {...formProps} />;
          case FormField.ListField:
            return <ListField {...formProps} />;
          case FormField.TagsForm:
            return <HashTagsForm {...formProps} />;
          case FormField.FieldSet:
            return <FieldSetCreator key={f.name} form={f} />;
          case FormField.Date:
            return <DateField {...formProps} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default FormFieldCreator;
