import { act, fireEvent, render, screen } from '@testing-library/react';
import { FieldValues, FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import mockI18next from '@/mocks/mockI18next';
import LinkField from './LinkField';

jest.mock('react-i18next', () => mockI18next());

let formMethods: UseFormReturn<FieldValues>;

const TestForm = ({ value }: { value: string }) => {
  const methods = useForm<FieldValues>({ defaultValues: { link: value } });
  formMethods = methods;

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
    render(<TestForm value="https://example.com" />);

    act(() => formMethods.setError('link', { message: 'error' }));

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
