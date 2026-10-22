import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import mockI18next from '@/mocks/mockI18next';
import TextField from '@/components/shared/TextField';
import NumberField from '@/components/shared/NumberField';
import DateField from '@/components/shared/DateField';
import TextAreaField from '@/components/shared/TextAreaField';
import RadioCheckboxField from '@/components/shared/RadioCheckboxField';

jest.mock('react-i18next', () => mockI18next());

function Fields({
  viewer = false,
  inputStyle = viewer,
}: {
  viewer?: boolean;
  inputStyle?: boolean;
}) {
  const methods = useForm<FieldValues>({
    defaultValues: {
      text: 'Project name',
      number: 42,
      date: '1.1.2026',
      description: 'Description',
      choice: true,
    },
  });
  const presentation = { readOnlyVariant: inputStyle ? ('input' as const) : undefined };

  return (
    <form className={viewer ? 'project-form viewer-only-project-form' : 'project-form'}>
      <FormProvider {...methods}>
        <TextField
          {...presentation}
          name="text"
          label="Name"
          tooltip="Name helper"
          readOnly={viewer}
        />
        <NumberField {...presentation} name="number" label="Cost" readOnly={viewer} />
        <TextField {...presentation} name="editableText" label="Editable name" readOnly={false} />
        <NumberField
          {...presentation}
          name="editableNumber"
          label="Editable cost"
          readOnly={false}
        />
        <DateField {...presentation} name="date" label="Date" readOnly={viewer} />
        <TextAreaField {...presentation} name="description" label="Description" readOnly={viewer} />
        <RadioCheckboxField
          {...presentation}
          name="choice"
          label="Choice"
          control={methods.control}
          readOnly={viewer}
        />
      </FormProvider>
    </form>
  );
}

describe('Viewer-only project basics fields', () => {
  it('preserves legacy read-only rendering without the input variant', () => {
    render(<Fields viewer inputStyle={false} />);

    const text = screen.getByRole('textbox', { name: 'Name' });
    expect(text.tagName).toBe('INPUT');
    expect(text).toHaveAttribute('readonly');
    expect(text).not.toBeDisabled();
    expect(screen.getByRole('spinbutton', { name: 'Cost' })).not.toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Description' })).not.toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveStyle('overflow: visible');
  });

  it('allows individual fields to remain editable through explicit props', async () => {
    const user = userEvent.setup();
    render(<Fields viewer />);

    await user.type(screen.getByRole('textbox', { name: 'Editable name' }), 'Allowed');
    await user.type(screen.getByRole('spinbutton', { name: 'Editable cost' }), '7');

    expect(screen.getByRole('textbox', { name: 'Editable name' })).toHaveValue('Allowed');
    expect(screen.getByRole('spinbutton', { name: 'Editable cost' })).toHaveValue(7);
  });

  it('keeps text fields read-only and displays the yes/no value as a text field', async () => {
    const user = userEvent.setup();
    render(<Fields viewer />);

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('readonly');
    expect(screen.getByRole('spinbutton', { name: 'Cost' })).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox', { name: 'Date' })).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox', { name: 'Name' }).tagName).toBe('TEXTAREA');
    for (const label of ['Name', 'Date', 'Description']) {
      expect(screen.getByRole('textbox', { name: label })).toBeDisabled();
    }
    expect(screen.getByRole('spinbutton', { name: 'Cost' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveStyle('overflow: hidden');
    expect(within(screen.getByTestId('date')).queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Name helper')).toBeVisible();
    expect(within(screen.getByTestId('choice')).getByDisplayValue('Kyllä')).toHaveAttribute(
      'readonly',
    );
    expect(screen.queryByTestId('choice-0')).not.toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'changed');
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'changed');

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Project name');
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('Description');
  });

  it('preserves editable fields and native yes/no controls for other users', async () => {
    const user = userEvent.setup();
    render(<Fields />);

    expect(screen.getByRole('textbox', { name: 'Name' })).not.toHaveAttribute('readonly');
    expect(screen.getByRole('spinbutton', { name: 'Cost' })).not.toHaveAttribute('readonly');
    expect(within(screen.getByTestId('date')).getByRole('button')).toBeEnabled();
    expect(screen.getByTestId('choice-0')).toBeEnabled();
    expect(screen.getByTestId('choice-1')).toBeEnabled();

    await user.type(screen.getByRole('textbox', { name: 'Name' }), ' updated');

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Project name updated');
  });
});
