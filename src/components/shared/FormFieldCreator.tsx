import { ListType } from '@/interfaces/common';
import { FormField, IForm } from '@/interfaces/formInterfaces';
import { NumberInput } from 'hds-react/components/NumberInput';
import { FC, MouseEvent, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import DateField from './DateField';
import FieldSetCreator from './FieldSetCreator';
import FormFieldLabel from './FormFieldLabel';
import FormSectionTitle from './FormSectionTitle';
import HashTagsForm from './HashTagsForm';
import ListField from './ListField';
import NumberField from './NumberField';
import SelectField from './SelectField';
import TextField from './TextField';

const OverrunRightField = ({ form }: { form: any }) => {
  const [editing, setEditing] = useState(false);

  const handleSetEditing = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditing(!editing);
  };

  return (
    <div className="input-wrapper" id="overrunRight">
      <Controller
        name="budgetOverrunYear"
        control={form.control as Control<FieldValues>}
        render={({ field }) => (
          <FormFieldLabel text={`Ylitysoikeus ${field.value}`} onClick={handleSetEditing} />
        )}
      />
      <Controller
        name="budgetOverrunAmount"
        control={form.control as Control<FieldValues>}
        render={({ field }) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <NumberInput
              className="list-field-input"
              style={{ width: !editing ? '1.5rem' : '8rem' }}
              {...field}
              label={''}
              hideLabel={true}
              id={field.name}
              readOnly={!editing || form.readOnly}
            />
            <span style={{ display: editing ? 'none' : '' }}>keur</span>
          </div>
        )}
      />
      {/* <Controller /> */}
    </div>
  );
};

interface IFormFieldCreatorProps {
  form: Array<IForm>;
}

const FormFieldCreator: FC<IFormFieldCreatorProps> = ({ form }) => {
  return (
    <>
      {form?.map((f) => {
        const { type, ...formValues } = f;
        const formProps = { ...formValues, key: f.name };
        const listFormProps = { form: f, key: f.name };
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
            return <ListField {...listFormProps} />;
          case FormField.TagsForm:
            return <HashTagsForm {...formProps} />;
          case FormField.FieldSet:
            return <FieldSetCreator {...listFormProps} />;
          case FormField.Date:
            return <DateField {...formProps} />;
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
