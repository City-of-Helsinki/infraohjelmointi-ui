import { ListType } from '@/interfaces/common';
import { FormField, IForm } from '@/interfaces/formInterfaces';
import { FC } from 'react';
import { ProjectHashTags } from '../Project/ProjectHashTags';
import CheckboxField from './CheckboxField';
import DateField from './DateField';
import FieldSetCreator from './FieldSetCreator';
import FormSectionTitle from './FormSectionTitle';
import ListField from './ListField';
import MultiSelectField from './MultiSelectField';
import NumberField from './NumberField';
import OverrunRightField from './OverrunRightField';
import RadioCheckboxField from './RadioCheckboxField';
import SelectField from './SelectField';
import TextAreaField from './TextAreaField';
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
          case FormField.HashTagsForm:
            return <ProjectHashTags {...formProps} />;
          case FormField.FieldSet:
            return <FieldSetCreator {...listFormProps} />;
          case FormField.Date:
            return <DateField {...formProps} />;
          case FormField.RadioCheckbox:
            return <RadioCheckboxField {...formProps} />;
          case FormField.OverrunRight:
            return <OverrunRightField key={f.name} form={f} />;
          case FormField.TextArea:
            return <TextAreaField {...formProps} />;
          case FormField.Checkbox:
            return <CheckboxField {...formProps} />;
          case FormField.MultiSelect:
            return <MultiSelectField {...formProps} name={listName} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default FormFieldCreator;
