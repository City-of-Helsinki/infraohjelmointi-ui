import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectProps, Tooltip } from 'hds-react';
import { FieldValues, useForm } from 'react-hook-form';
import { useState } from 'react';
import mockI18next from '@/mocks/mockI18next';
import SelectField from './SelectField';
import TextField from './TextField';

jest.mock('react-i18next', () => mockI18next());

jest.mock('hds-react', () => {
  const actual = jest.requireActual('hds-react');

  return {
    ...actual,
    Select: ({
      onChange,
      clearable,
      tooltip,
      texts,
      disabled,
      ...props
    }: {
      onChange?: (selectedOptions: unknown[], clickedOption?: unknown) => void;
      clearable?: boolean;
    } & Pick<SelectProps, 'tooltip' | 'texts' | 'disabled'>) =>
      disabled ? (
        <actual.Select
          {...props}
          disabled={disabled}
          onChange={onChange}
          clearable={clearable}
          tooltip={tooltip}
          texts={texts}
        />
      ) : (
        <div>
          <span>{typeof texts === 'object' ? texts?.label : undefined}</span>
          {tooltip}
          <button type="button" onClick={() => onChange?.([], undefined)}>
            clear selection
          </button>
          <span data-testid="clearable-flag">{String(clearable)}</span>
        </div>
      ),
  };
});

const TestForm = ({ readOnly = false, disabled }: { readOnly?: boolean; disabled?: boolean }) => {
  const { control, getValues } = useForm<FieldValues>({
    defaultValues: {
      first: { value: 'test', label: 'Test' },
    },
  });
  const [currentValue, setCurrentValue] = useState('');

  return (
    <div>
      <SelectField
        name="first"
        control={control}
        options={[{ value: 'test', label: 'Test' }]}
        label="first"
        iconKey="location"
        clearable
        readOnly={readOnly}
        readOnlyVariant="input"
        disabled={disabled}
        tooltip={<Tooltip>Editable details</Tooltip>}
      />
      <TextField name="text" control={control} label="Text label" tooltip="Existing helper text" />
      <button type="button" onClick={() => setCurrentValue(JSON.stringify(getValues('first')))}>
        read value
      </button>
      <div data-testid="current-value">{currentValue}</div>
    </div>
  );
};

const ReadOnlyForm = ({ readOnlyVariant = 'text' }: { readOnlyVariant?: 'text' | 'input' }) => {
  const { control } = useForm<FieldValues>({
    defaultValues: {
      first: { value: 'test', label: 'Test' },
      second: undefined,
    },
  });

  return (
    <>
      <SelectField
        name="first"
        control={control}
        options={[{ value: 'test', label: 'Test' }]}
        label="first"
        readOnly
        readOnlyVariant={readOnlyVariant}
        tooltip={<Tooltip>Category details</Tooltip>}
      />
      <SelectField
        name="second"
        control={control}
        options={[]}
        label="second"
        readOnly
        readOnlyVariant={readOnlyVariant}
        tooltip={<Tooltip>Priority details</Tooltip>}
      />
      <SelectField name="third" control={control} options={[]} label="third" readOnly />
    </>
  );
};

describe('SelectField', () => {
  it('locks selects through explicit props without disabling tooltips', async () => {
    const user = userEvent.setup();
    render(<TestForm readOnly />);

    const select = screen.getByTestId('first');
    expect(select.querySelector('.read-only-select')).not.toBeNull();
    expect(select.querySelector('.select-field-wrapper.with-icon')).not.toBeNull();
    expect(select.querySelector('.custom-select.icon svg')).not.toBeNull();
    const trigger = select.querySelector('[aria-disabled="true"]');
    if (!(trigger instanceof HTMLElement)) {
      throw new Error('Expected a disabled select trigger');
    }

    await user.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.click(within(select).getByRole('button', { name: /tooltip/i }));
    expect(await screen.findByText('Editable details')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'read value' }));
    expect(screen.getByTestId('current-value')).toHaveTextContent(
      '{"value":"test","label":"Test"}',
    );
  });

  it('keeps a select editable when readOnly is false', () => {
    render(<TestForm readOnly={false} />);

    expect(screen.getByRole('button', { name: 'clear selection' })).toBeEnabled();
    expect(screen.getByTestId('first').querySelector('.read-only-select')).toBeNull();
  });

  it('preserves ordinary disabled selects without opting into the basics appearance', () => {
    render(<TestForm disabled />);

    const select = screen.getByTestId('first');
    expect(select.querySelector('[aria-disabled="true"]')).not.toBeNull();
    expect(select.querySelector('.read-only-select')).toBeNull();
    expect(within(select).getByRole('button', { name: /tooltip/i })).toBeEnabled();
  });

  it('can render a disabled select with an independently usable tooltip', async () => {
    const user = userEvent.setup();
    render(<ReadOnlyForm readOnlyVariant="input" />);

    const field = within(screen.getByTestId('first'));
    expect(field.queryByRole('textbox')).not.toBeInTheDocument();
    expect(field.getByText('Test')).toBeVisible();
    expect(field.getByText('first')).toBeVisible();
    expect(field.getByRole('button', { name: /tooltip/i })).toBeEnabled();
    const trigger = screen.getByTestId('first').querySelector('[aria-disabled="true"]');
    if (!(trigger instanceof HTMLElement)) {
      throw new Error('Expected a disabled select trigger');
    }

    await user.click(trigger);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.click(field.getByRole('button', { name: /tooltip/i }));

    expect(await screen.findByText('Category details')).toBeVisible();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('handles clear event safely when clicked option is undefined', async () => {
    render(<TestForm />);

    expect(screen.getByTestId('clearable-flag')).toHaveTextContent('true');

    fireEvent.click(screen.getByRole('button', { name: 'clear selection' }));
    fireEvent.click(screen.getByRole('button', { name: 'read value' }));

    await waitFor(() => {
      expect(screen.getByTestId('current-value')).toHaveTextContent('{"value":"","label":""}');
    });

    await waitFor(() => {
      expect(screen.getByTestId('clearable-flag')).toHaveTextContent('false');
    });
  });

  it('preserves develop text rendering for ordinary boolean readOnly callers', () => {
    render(<ReadOnlyForm />);

    expect(screen.getByDisplayValue('Test')).toHaveAttribute('readonly');
    expect(screen.getByText('first')).toBeVisible();
    expect(screen.getByText('second')).toBeVisible();
    expect(screen.getByText('third')).toBeVisible();
    for (const name of ['first', 'second', 'third']) {
      const field = within(screen.getByTestId(name));
      expect(field.getByRole('textbox')).toHaveAttribute('readonly');
      expect(field.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByTestId(name).querySelector('.read-only-select')).toBeNull();
    }
    expect(screen.queryByRole('button', { name: 'clear selection' })).not.toBeInTheDocument();
  });

  it('preserves editable select tooltips and text field labels and helper text', async () => {
    const user = userEvent.setup();
    render(<TestForm />);

    expect(screen.getByText('first')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Text label' })).not.toHaveAttribute('readonly');
    expect(screen.getByText('Existing helper text')).toBeVisible();
    expect(within(screen.getByTestId('text')).queryByRole('button')).not.toBeInTheDocument();

    const select = within(screen.getByTestId('first'));
    await user.click(select.getByRole('button', { name: /tooltip/i }));

    expect(await screen.findByText('Editable details')).toBeVisible();
    expect(screen.getByRole('button', { name: 'clear selection' })).toBeEnabled();
  });

  it.each([
    ['first', 'Category details'],
    ['second', 'Priority details'],
  ])('opens the tooltip for readonly field %s without enabling editing', async (name, content) => {
    const user = userEvent.setup();
    render(<ReadOnlyForm readOnlyVariant="input" />);

    const field = within(screen.getByTestId(name));
    expect(screen.getByTestId(name).querySelector('[aria-disabled="true"]')).not.toBeNull();

    await user.click(field.getByRole('button', { name: /tooltip/i }));

    expect(await screen.findByText(content)).toBeVisible();
    expect(screen.getByTestId(name).querySelector('[aria-disabled="true"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'clear selection' })).not.toBeInTheDocument();
  });
});
