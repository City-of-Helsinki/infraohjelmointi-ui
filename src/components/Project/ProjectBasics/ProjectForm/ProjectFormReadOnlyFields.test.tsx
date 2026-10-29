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

function Fields({ viewer = false }: { viewer?: boolean }) {
  const methods = useForm<FieldValues>({
    defaultValues: {
      text: 'Project name',
      number: 42,
      date: '1.1.2026',
      description: 'Description',
      choice: true,
    },
  });
  return (
    <form className={viewer ? 'project-form viewer-only-project-form' : 'project-form'}>
      <FormProvider {...methods}>
        <TextField name="text" label="Name" tooltip="Name helper" disabled={viewer} />
        <NumberField name="number" label="Cost" disabled={viewer} />
        <TextField name="editableText" label="Editable name" readOnly={false} />
        <NumberField name="editableNumber" label="Editable cost" disabled={false} />
        <DateField name="date" label="Date" disabled={viewer} />
        <TextAreaField name="description" label="Description" disabled={viewer} />
        <RadioCheckboxField
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
  it('renders viewer-only text, number, date, and textarea fields as disabled', () => {
    render(<Fields viewer />);

    const text = screen.getByRole('textbox', { name: 'Name' });
    expect(text.tagName).toBe('INPUT');
    expect(text).toBeDisabled();
    expect(screen.getByRole('spinbutton', { name: 'Cost' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Date' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeDisabled();
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

  it('keeps disabled fields and displays the yes/no value as a text field', async () => {
    const user = userEvent.setup();
    render(<Fields viewer />);

    for (const label of ['Name', 'Date', 'Description']) {
      expect(screen.getByRole('textbox', { name: label })).toBeDisabled();
    }
    expect(screen.getByRole('spinbutton', { name: 'Cost' })).toBeDisabled();
    expect(within(screen.getByTestId('date')).getByRole('button')).toBeDisabled();
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

    expect(screen.getByRole('textbox', { name: 'Name' })).not.toBeDisabled();
    expect(screen.getByRole('spinbutton', { name: 'Cost' })).not.toHaveAttribute('readonly');
    expect(within(screen.getByTestId('date')).getByRole('button')).toBeEnabled();
    expect(screen.getByTestId('choice-0')).toBeEnabled();
    expect(screen.getByTestId('choice-1')).toBeEnabled();

    await user.type(screen.getByRole('textbox', { name: 'Name' }), ' updated');

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Project name updated');
  });
});
