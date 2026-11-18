import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, type Select } from 'hds-react';
import type { ComponentProps } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useState } from 'react';
import SelectField from './SelectField';
import TextField from './TextField';

vi.mock('react-i18next', async () => {
  const { createInstance } = await import('i18next');
  const instance = createInstance();
  await instance.init({
    lng: 'fi',
    resources: {
      fi: {
        translation: {
          option: { design: 'Translated design', literal: 'Keep option.label text' },
        },
      },
    },
  });
  return { useTranslation: () => ({ t: instance.t, i18n: instance }) };
});

vi.mock('hds-react', async () => {
  const actual = await vi.importActual<typeof import('hds-react')>('hds-react');

  return {
    ...actual,
    Select: ({
      onChange,
      clearable,
      tooltip,
      texts,
      disabled,
      options,
      ...props
    }: {
      onChange?: (selectedOptions: unknown[], clickedOption?: unknown) => void;
      clearable?: boolean;
    } & Pick<ComponentProps<typeof Select>, 'tooltip' | 'texts' | 'disabled' | 'options'>) =>
      disabled ? (
        <actual.Select
          {...props}
          disabled={disabled}
          onChange={onChange}
          clearable={clearable}
          tooltip={tooltip}
          texts={texts}
          options={options}
        />
      ) : (
        <div>
          <span>{typeof texts === 'object' ? texts?.label : undefined}</span>
          {tooltip}
          <button type="button" onClick={() => onChange?.([], undefined)}>
            clear selection
          </button>
          <span data-testid="clearable-flag">{String(clearable)}</span>
          <span data-testid="option-labels">
            {options
              ?.map((option) => (typeof option === 'string' ? option : option.label))
              .join('|')}
          </span>
        </div>
      ),
  };
});

const TestForm = ({
  readOnly = false,
  disabled,
  optionLabel = 'Test',
  shouldTranslate = true,
}: {
  readOnly?: boolean;
  disabled?: boolean;
  optionLabel?: string;
  shouldTranslate?: boolean;
}) => {
  const { control, getValues } = useForm<FieldValues>({
    defaultValues: {
      first: { value: 'test', label: optionLabel },
    },
  });
  const [currentValue, setCurrentValue] = useState('');

  return (
    <div>
      <SelectField
        name="first"
        control={control}
        options={[{ value: 'test', label: optionLabel }]}
        label="first"
        iconKey="location"
        clearable
        readOnly={readOnly}
        shouldTranslate={shouldTranslate}
        disabled={disabled}
        tooltip={<Tooltip>Editable details</Tooltip>}
      />
      <TextField
        name="text"
        control={control}
        label="Text label"
        helperText="Existing helper text"
      />
      <button type="button" onClick={() => setCurrentValue(JSON.stringify(getValues('first')))}>
        read value
      </button>
      <div data-testid="current-value">{currentValue}</div>
    </div>
  );
};

const ReadOnlyForm = () => {
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
        tooltip={<Tooltip>Category details</Tooltip>}
      />
      <SelectField
        name="second"
        control={control}
        options={[]}
        label="second"
        readOnly
        tooltip={<Tooltip>Priority details</Tooltip>}
      />
      <SelectField name="third" control={control} options={[]} label="third" readOnly />
    </>
  );
};

describe('SelectField', () => {
  it.each([
    ['design', 'Translated design'],
    ['literal', 'Keep option.label text'],
    ['Custom category', 'Custom category'],
    ['Custom.category', 'Custom.category'],
    ['de.sign', 'de.sign'],
    ['A {{name}} $t(option.design)', 'A {{name}} $t(option.design)'],
    ['new option', 'new option'],
    ['option.newValue', 'option.newValue'],
  ])('displays %s as %s in dropdown options and readonly values', (optionLabel, expected) => {
    const { unmount } = render(<TestForm optionLabel={optionLabel} />);
    expect(screen.getByTestId('option-labels')).toHaveTextContent(expected);
    unmount();

    render(<TestForm optionLabel={optionLabel} readOnly />);
    expect(within(screen.getByTestId('first')).getByRole('textbox')).toHaveValue(expected);
  });

  it('keeps labels unchanged when translation is disabled', () => {
    render(<TestForm optionLabel="design" shouldTranslate={false} readOnly />);
    expect(within(screen.getByTestId('first')).getByRole('textbox')).toHaveValue('design');
  });

  it('renders readonly select values as disabled text fields', () => {
    render(<TestForm readOnly />);

    const select = screen.getByTestId('first');
    expect(select.querySelector('.select-field-wrapper.with-icon')).not.toBeNull();
    expect(within(select).getByRole('textbox')).toBeDisabled();
    expect(within(select).getByRole('textbox')).toHaveValue('Test');

    fireEvent.click(screen.getByRole('button', { name: 'read value' }));
    expect(screen.getByTestId('current-value')).toHaveTextContent(
      '{"value":"test","label":"Test"}',
    );
  });

  it('keeps a select editable when readOnly is false', () => {
    render(<TestForm readOnly={false} />);

    expect(screen.getByRole('button', { name: 'clear selection' })).toBeEnabled();
    expect(within(screen.getByTestId('first')).queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('preserves ordinary disabled selects without opting into the basics appearance', () => {
    render(<TestForm disabled />);

    const select = screen.getByTestId('first');
    expect(select.querySelector('[aria-disabled="true"]')).not.toBeNull();
    expect(within(select).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(select).getByRole('button', { name: /tooltip/i })).toBeEnabled();
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

  it('renders readonly values in disabled text fields', () => {
    render(<ReadOnlyForm />);

    expect(screen.getByDisplayValue('Test')).toBeDisabled();
    expect(screen.getByText('first')).toBeVisible();
    expect(screen.getByText('second')).toBeVisible();
    expect(screen.getByText('third')).toBeVisible();
    for (const name of ['first', 'second', 'third']) {
      const field = within(screen.getByTestId(name));
      expect(field.getByRole('textbox')).toBeDisabled();
    }
    expect(within(screen.getByTestId('first')).getByRole('button')).toBeVisible();
    expect(within(screen.getByTestId('second')).getByRole('button')).toBeVisible();
    expect(within(screen.getByTestId('third')).queryByRole('button')).not.toBeInTheDocument();
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
});
