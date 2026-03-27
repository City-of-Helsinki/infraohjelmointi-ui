import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import mockI18next from '@/mocks/mockI18next';
import SelectField from './SelectField';

jest.mock('react-i18next', () => mockI18next());

jest.mock('hds-react', () => {
  const actual = jest.requireActual('hds-react');

  return {
    ...actual,
    Select: ({
      onChange,
      clearable,
    }: {
      onChange?: (selectedOptions: unknown[], clickedOption?: unknown) => void;
      clearable?: boolean;
    }) => (
      <div>
        <button type="button" onClick={() => onChange?.([], undefined)}>
          clear selection
        </button>
        <span data-testid="clearable-flag">{String(clearable)}</span>
      </div>
    ),
  };
});

type FormValue = { value: string; label: string };
type FormData = {
  first?: FormValue;
  second?: FormValue;
};

const TestForm = () => {
  const { control, getValues } = useForm<FormData>({
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
        clearable
      />
      <button type="button" onClick={() => setCurrentValue(JSON.stringify(getValues('first')))}>
        read value
      </button>
      <div data-testid="current-value">{currentValue}</div>
    </div>
  );
};

const ReadOnlyForm = () => {
  const { control } = useForm<FormData>({
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
      />
      <SelectField name="second" control={control} options={[]} label="second" readOnly />
    </>
  );
};

describe('SelectField', () => {
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

  it('renders readonly value from selected option label', () => {
    render(<ReadOnlyForm />);

    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'clear selection' })).not.toBeInTheDocument();
  });
});
