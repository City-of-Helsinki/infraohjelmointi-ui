import { FormField, IForm } from '@/interfaces/formInterfaces';
import { NumberInput } from 'hds-react/components/NumberInput';
import { FC, memo, MouseEvent, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import FormFieldLabel from './FormFieldLabel';

interface IListFieldProps {
  form: IForm;
}

const ListField: FC<IListFieldProps> = ({ form }) => {
  const { label, readOnly, name } = form;
  const [editing, setEditing] = useState(false);

  const handleSetEditing = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditing(!editing);
  };

  return (
    <div className="input-wrapper" id={name} data-testid={name}>
      <div className="display-flex-col">
        <div style={{ marginBottom: '1rem' }}>
          <FormFieldLabel text={label} onClick={readOnly ? undefined : handleSetEditing} />
        </div>
        {form.fieldSet?.map((f) => (
          <Controller
            key={f.name}
            name={f.name}
            control={f.control as Control<FieldValues>}
            render={({ field }) => {
              if (f.type === FormField.Number) {
                return (
                  <div className="list-field-row" key={f.label}>
                    <label className="list-field-item-label">{f.label}</label>
                    <NumberInput
                      className="list-field-input"
                      {...field}
                      label={''}
                      hideLabel={true}
                      id={field.name}
                      readOnly={!editing || f.readOnly}
                    />
                    €
                  </div>
                );
              } else {
                return <></>;
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

{
  /* {listItems.length > 0 &&
            listItems.map((nn) => (
              <div className="nn-row" key={nn.label}>
                <label className="nn-label">{nn.label}</label>
                <Span size="m" text={nn.value} fontWeight="light" />
              </div>
            ))} */
}

// interface IListFieldProps {
//   form: IForm;
// }

// const ListField: FC<IListFieldProps> = ({ form }) => {
//   return (
//     <ListFieldContainer {...field} {...fieldState} label={label} readOnly={readOnly} />
//     // <Controller
//     //   name={name}
//     //   control={control as Control<FieldValues>}
//     //   render={({ field, fieldState }) => (
//     //     <ListFieldContainer {...field} {...fieldState} label={label} readOnly={readOnly} />
//     //   )}
//     // />
//   );
// };

// ListFieldContainer.displayName = 'ListFieldContainer';

export default memo(ListField);
