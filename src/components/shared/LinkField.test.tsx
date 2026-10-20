import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { FieldValues, FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import mockI18next from '@/mocks/mockI18next';
import LinkField from './LinkField';

jest.mock('react-i18next', () => mockI18next());

const TestForm = ({
  value,
  onFormReady,
}: {
  value: string;
  onFormReady?: (methods: UseFormReturn<FieldValues>) => void;
}) => {
  const methods = useForm<FieldValues>({ defaultValues: { link: value } });

  useEffect(() => {
    onFormReady?.(methods);
  }, [methods, onFormReady]);

  return (
    <FormProvider {...methods}>
      <LinkField name="link" label="link" />
    </FormProvider>
  );
};

describe('LinkField', () => {
  it('renders a safe external link for a valid http(s) url', () => {
    render(<TestForm value="  https://example.com/path  " />);

    const link = screen.getByRole('link', { name: 'https://example.com/path' });
    expect(link).toHaveAttribute('href', 'https://example.com/path');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it.each(['', 'not a url', 'javascript:alert(1)', 'ftp://example.com'])(
    'does not render a link for value "%s"',
    (value) => {
      render(<TestForm value={value} />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    },
  );

  it('hides the link while the input is focused', () => {
    render(<TestForm value="https://example.com" />);
    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    fireEvent.blur(input);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('hides the link when the field has an error', () => {
    let formMethods: UseFormReturn<FieldValues> | undefined;
    render(
      <TestForm
        value="https://example.com"
        onFormReady={(methods) => {
          formMethods = methods;
        }}
      />,
    );

    act(() => formMethods?.setError('link', { message: 'error' }));

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
