import { ListType } from '@/interfaces/common';
import { FormField, IForm } from '@/interfaces/formInterfaces';
import { FC } from 'react';
import DateField from './DateField';
import FieldSetCreator from './FieldSetCreator';
import FormSectionTitle from './FormSectionTitle';
import HashTagsForm from './HashTagsForm';
import ListField from './ListField';
import NumberField from './NumberField';
import OverrunRightField from './OverrunRightField';
import RadioCheckboxField from './RadioCheckboxField';
import SelectField from './SelectField';
import TextField from './TextField';

interface IFormFieldCreatorProps {
  form: Array<IForm>;
}

const FormFieldCreator: FC<IFormFieldCreatorProps> = ({ form }) => {
  return (
    <>
      {form?.map((f, i) => {
        const { type, ...formValues } = f;
        const formProps = { ...formValues, key: f.name };
        const listFormProps = { form: f, key: f.name };
        const listName = f.name as ListType;
        switch (type) {
          case FormField.Select:
            return <SelectField {...formProps} key={i} name={listName} />;
          case FormField.Text:
            return <TextField {...formProps} />;
          case FormField.Number:
            return <NumberField {...formProps} />;
          case FormField.Title:
            return <FormSectionTitle {...formProps} />;
          case FormField.ListField:
            return <ListField {...listFormProps} />;
          case FormField.TagsForm:
            return <HashTagsForm {...formProps} />;
          case FormField.FieldSet:
            return <FieldSetCreator {...listFormProps} />;
          case FormField.Date:
            return <DateField {...formProps} />;
          case FormField.RadioCheckbox:
            return <RadioCheckboxField {...formProps} />;
          case FormField.OverrunRight:
            return <OverrunRightField key={f.name} form={f} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default FormFieldCreator;
