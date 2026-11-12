import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from 'hds-react';
import { useState } from 'react';
import { optionWithLabel } from '@/utils/testUtils';
import HdsSearchInput from './HdsSearchInput';

vi.mock('react-i18next', async () => (await import('@/mocks/mockI18next')).default());

interface SearchOption {
  label: string;
  value: string;
}

const options: SearchOption[] = [{ label: 'Alpha project', value: 'alpha' }];

const ControlledSearch = ({
  onChange,
  onSubmit,
  getSuggestions,
  resetOnSubmit = false,
}: {
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  getSuggestions?: (query: string) => Promise<SearchOption[]>;
  resetOnSubmit?: boolean;
}) => {
  const [value, setValue] = useState('');
  return (
    <>
      <HdsSearchInput
        label="Projects"
        clearButtonAriaLabel="Clear"
        searchButtonAriaLabel="Submit"
        value={value}
        onChange={(nextValue) => {
          onChange(nextValue);
          setValue(nextValue);
        }}
        onSubmit={(nextValue) => {
          onSubmit(nextValue);
          if (resetOnSubmit) setValue('');
        }}
        getSuggestions={getSuggestions}
      />
      <button type="button" onClick={() => setValue('')}>
        Reset external value
      </button>
    </>
  );
};

describe('HdsSearchInput with real HDS', () => {
  it('shows validation errors without limiting or truncating the input', () => {
    const { rerender } = render(
      <HdsSearchInput label="Projects" errorText="Maximum length is 5 characters" value="123456" />,
    );
    const input = screen.getByRole('searchbox', { name: 'Projects' });
    expect(input).not.toHaveAttribute('maxlength');
    expect(input).toHaveValue('123456');
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Maximum length is 5 characters');
    expect(error.querySelector('svg')).toBeInTheDocument();

    rerender(<HdsSearchInput label="Projects" value="123456" />);
    expect(screen.queryByText('Maximum length is 5 characters')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables the input and buttons explicitly and re-enables them when requested', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <HdsSearchInput label="Projects" disabled onChange={onChange} onSubmit={vi.fn()} />,
    );
    const input = screen.getByRole('searchbox', { name: 'Projects' });
    expect(input).toBeDisabled();
    expect(input.closest('fieldset')).toHaveAttribute('inert');
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
    onChange.mockClear();
    await user.type(input, '12345');
    expect(onChange).not.toHaveBeenCalled();

    rerender(<HdsSearchInput label="Projects" disabled={false} onChange={onChange} />);
    expect(screen.getByRole('searchbox', { name: 'Projects' })).toBeEnabled();
    expect(screen.getByRole('searchbox').closest('fieldset')).not.toHaveAttribute('inert');
    await user.type(screen.getByRole('searchbox'), '12345');
    expect(onChange).toHaveBeenCalled();
  });

  it('preserves HDS metadata across ordinary parent renders', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const getSuggestions = async () => options;
    const { rerender } = render(
      <ControlledSearch onChange={onChange} onSubmit={onSubmit} getSuggestions={getSuggestions} />,
    );
    const input = screen.getByRole('combobox');
    const inputId = input.id;
    await user.type(input, 'Al');
    await screen.findByRole('option', optionWithLabel('Alpha project'));
    const notifications = screen.getByTestId('hds-search-screen-reader-notifications');
    const announcements = notifications.textContent;
    expect(announcements).not.toBe('');

    rerender(
      <ControlledSearch onChange={onChange} onSubmit={onSubmit} getSuggestions={getSuggestions} />,
    );

    expect(input).toHaveAttribute('id', inputId);
    expect(input).toHaveValue('Al');
    expect(notifications).toHaveTextContent(announcements ?? '');
    await user.click(screen.getByRole('option', optionWithLabel('Alpha project')));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Alpha project');
  });

  it('updates memoized texts when their props change', () => {
    const { rerender } = render(
      <HdsSearchInput label="Projects" helperText="Find projects" clearButtonAriaLabel="Clear" />,
    );

    rerender(
      <HdsSearchInput
        label="Groups"
        helperText="Find groups"
        clearButtonAriaLabel="Clear groups"
        searchButtonAriaLabel="Submit groups"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('searchbox', { name: 'Groups' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveAccessibleDescription('Find groups');
    expect(screen.getByRole('button', { name: 'Clear groups' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit groups' })).toBeInTheDocument();
  });

  it('verifies HDS itself reports controlled/internal value mismatches without a React event', () => {
    const onChange = vi.fn();
    render(<Search value="Alpha" onChange={onChange} texts={{ label: 'Projects' }} />);

    expect(screen.getByRole('searchbox')).toHaveValue('Alpha');
    expect(onChange).toHaveBeenCalledWith({ target: { value: '' } });
  });

  it('verifies HDS itself echoes stale internal text while typing a controlled value', async () => {
    const user = userEvent.setup();
    const onNotification = vi.fn();
    const HdsControlledSearch = () => {
      const [value, setValue] = useState('');
      return (
        <Search
          value={value}
          texts={{ label: 'Projects' }}
          onChange={(event) => {
            if (event.type === 'change') setValue(event.target.value);
            else onNotification(event);
          }}
        />
      );
    };
    render(<HdsControlledSearch />);

    await user.type(screen.getByRole('searchbox'), 'Alpha');

    expect(screen.getByRole('searchbox')).toHaveValue('Alpha');
    expect(onNotification).toHaveBeenCalledWith({ target: { value: '' } });
  });

  it('keeps typed text and ignores delayed HDS notifications', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      <ControlledSearch
        onChange={onChange}
        onSubmit={onSubmit}
        getSuggestions={async () => options}
      />,
    );
    await user.type(screen.getByRole('combobox'), 'Alpha');
    await screen.findByRole('option', optionWithLabel('Alpha project'));
    expect(screen.getByRole('combobox')).toHaveValue('Alpha');
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([
      'A',
      'Al',
      'Alp',
      'Alph',
      'Alpha',
    ]);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit a suggestion when typing past its exact label', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ControlledSearch
        onChange={vi.fn()}
        onSubmit={onSubmit}
        getSuggestions={async () => [{ label: 'Alpha', value: 'alpha' }]}
      />,
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'Alpha');
    await screen.findByRole('option', optionWithLabel('Alpha'));
    await user.type(input, ' project');

    expect(input).toHaveValue('Alpha project');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([true, false])('clears text without submitting (controlled: %s)', async (controlled) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      controlled ? (
        <ControlledSearch onChange={onChange} onSubmit={onSubmit} />
      ) : (
        <HdsSearchInput
          label="Projects"
          clearButtonAriaLabel="Clear"
          onChange={onChange}
          onSubmit={onSubmit}
        />
      ),
    );
    await user.type(screen.getByRole('searchbox'), 'Alpha');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(onChange.mock.calls.every(([value]) => typeof value === 'string')).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each(['mouse', 'keyboard'])('submits a suggestion once using %s', async (method) => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ControlledSearch
        onChange={vi.fn()}
        onSubmit={onSubmit}
        getSuggestions={async () => options}
      />,
    );
    await user.type(screen.getByRole('combobox'), 'Al');
    const option = await screen.findByRole('option', optionWithLabel('Alpha project'));
    if (method === 'mouse') await user.click(option);
    else await user.keyboard('{ArrowDown}{Enter}');
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Alpha project');
  });

  it('submits typed text through Enter and the search button', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ControlledSearch onChange={vi.fn()} onSubmit={onSubmit} />);
    await user.type(screen.getByRole('searchbox'), 'Alpha{Enter}');
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Alpha');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onSubmit).toHaveBeenLastCalledWith('Alpha');
  });

  it('does not show a submit button when onSubmit is absent', () => {
    render(<HdsSearchInput label="Projects" searchButtonAriaLabel="Submit" />);

    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveAttribute('type', 'text');
  });

  it.each(['mouse', 'keyboard'])('submits an uncontrolled suggestion using %s', async (method) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      <HdsSearchInput
        label="Projects"
        onChange={onChange}
        onSubmit={onSubmit}
        getSuggestions={async () => options}
      />,
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'Al');
    const option = await screen.findByRole('option', optionWithLabel('Alpha project'));
    if (method === 'mouse') await user.click(option);
    else await user.keyboard('{ArrowDown}{Enter}');

    expect(input).toHaveValue('Alpha project');
    expect(onChange).toHaveBeenLastCalledWith('Alpha project');
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Alpha project');
  });

  it.each(['mouse', 'keyboard'])(
    'submits a suggestion matching the complete typed label using %s',
    async (method) => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <ControlledSearch
          onChange={vi.fn()}
          onSubmit={onSubmit}
          getSuggestions={async () => options}
        />,
      );

      await user.type(screen.getByRole('combobox'), 'Alpha project');
      const option = await screen.findByRole('option', optionWithLabel('Alpha project'));
      expect(onSubmit).not.toHaveBeenCalled();
      if (method === 'mouse') await user.click(option);
      else await user.keyboard('{ArrowDown}{Enter}');

      expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Alpha project');
    },
  );

  it('can select the same suggestion again after submission resets the value', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ControlledSearch
        onChange={vi.fn()}
        onSubmit={onSubmit}
        getSuggestions={async () => options}
        resetOnSubmit
      />,
    );
    const input = screen.getByRole('combobox');

    for (const expectedCount of [1, 2]) {
      await user.type(input, 'Al');
      await user.click(await screen.findByRole('option', optionWithLabel('Alpha project')));

      expect(input).toHaveValue('');
      expect(onSubmit).toHaveBeenCalledTimes(expectedCount);
      expect(onSubmit).toHaveBeenLastCalledWith('Alpha project');
    }
  });

  it('selects a retained suggestion after submitting and reopening', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ControlledSearch
        onChange={vi.fn()}
        onSubmit={onSubmit}
        getSuggestions={async () => options}
      />,
    );
    const input = screen.getByRole('combobox');
    await user.type(input, 'Al');
    await screen.findByRole('option', optionWithLabel('Alpha project'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Al');

    await user.click(input);
    await user.click(await screen.findByRole('option', optionWithLabel('Alpha project')));

    expect(input).toHaveValue('Alpha project');
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onSubmit).toHaveBeenLastCalledWith('Alpha project');
  });

  it('accepts external value resets without reporting them as user changes', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <HdsSearchInput label="Projects" value="Alpha" onChange={onChange} />,
    );
    expect(screen.getByRole('searchbox')).toHaveValue('Alpha');
    rerender(<HdsSearchInput label="Projects" value="" onChange={onChange} />);
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not replace current suggestions with an older response', async () => {
    const user = userEvent.setup();
    const pending = new Map<string, (results: SearchOption[]) => void>();
    const getSuggestions = vi.fn(
      (query: string) => new Promise<SearchOption[]>((resolve) => pending.set(query, resolve)),
    );
    const onSubmit = vi.fn();
    render(
      <ControlledSearch onChange={vi.fn()} onSubmit={onSubmit} getSuggestions={getSuggestions} />,
    );
    await user.type(screen.getByRole('combobox'), 'a');
    await waitFor(() => expect(pending.has('a')).toBe(true));
    await user.clear(screen.getByRole('combobox'));
    await user.type(screen.getByRole('combobox'), 'b');
    await waitFor(() => expect(pending.has('b')).toBe(true));
    await act(async () => pending.get('b')?.([{ label: 'Beta project', value: 'beta' }]));
    await screen.findByRole('option', optionWithLabel('Beta project'));
    await act(async () => pending.get('a')?.(options));
    expect(screen.queryByRole('option', optionWithLabel('Alpha project'))).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', optionWithLabel('Beta project')));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Beta project');
  });

  it('does not replace current suggestions with an older response for the same query', async () => {
    const user = userEvent.setup();
    const pending: Array<(results: SearchOption[]) => void> = [];
    const getSuggestions = vi.fn(
      () => new Promise<SearchOption[]>((resolve) => pending.push(resolve)),
    );
    const onSubmit = vi.fn();
    render(
      <ControlledSearch onChange={vi.fn()} onSubmit={onSubmit} getSuggestions={getSuggestions} />,
    );
    const input = screen.getByRole('combobox');

    await user.type(input, 'a');
    await waitFor(() => expect(pending).toHaveLength(1));
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await user.type(input, 'a');
    await waitFor(() => expect(pending).toHaveLength(2));

    await act(async () => pending[1]([{ label: 'Current project', value: 'current' }]));
    await screen.findByRole('option', optionWithLabel('Current project'));
    await act(async () => pending[0](options));

    expect(screen.queryByRole('option', optionWithLabel('Alpha project'))).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', optionWithLabel('Current project')));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Current project');
  });

  it.each(['Clear', 'Reset external value'])(
    'does not restore pending results after %s',
    async (buttonName) => {
      const user = userEvent.setup();
      let resolveSearch: ((results: SearchOption[]) => void) | undefined;
      const getSuggestions = vi.fn(
        () =>
          new Promise<SearchOption[]>((resolve) => {
            resolveSearch = resolve;
          }),
      );
      const onSubmit = vi.fn();
      render(
        <ControlledSearch onChange={vi.fn()} onSubmit={onSubmit} getSuggestions={getSuggestions} />,
      );
      await user.type(screen.getByRole('combobox'), 'a');
      await waitFor(() => expect(getSuggestions).toHaveBeenCalled());
      await user.click(screen.getByRole('button', { name: buttonName }));
      await act(async () => resolveSearch?.(options));
      expect(screen.getByRole('combobox')).toHaveValue('');
      expect(
        screen.queryByRole('option', optionWithLabel('Alpha project')),
      ).not.toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    },
  );

  it('does not restore cached suggestions after an external reset with a request pending', async () => {
    const user = userEvent.setup();
    const pending = new Map<string, (results: SearchOption[]) => void>();
    const getSuggestions = vi.fn(
      (query: string) => new Promise<SearchOption[]>((resolve) => pending.set(query, resolve)),
    );
    const onSubmit = vi.fn();
    render(
      <ControlledSearch onChange={vi.fn()} onSubmit={onSubmit} getSuggestions={getSuggestions} />,
    );
    const input = screen.getByRole('combobox');

    await user.type(input, 'a');
    await waitFor(() => expect(pending.has('a')).toBe(true));
    await act(async () => pending.get('a')?.(options));
    await screen.findByRole('option', optionWithLabel('Alpha project'));
    await user.type(input, 'b');
    await waitFor(() => expect(pending.has('ab')).toBe(true));

    await user.click(screen.getByRole('button', { name: 'Reset external value' }));
    await act(async () => pending.get('ab')?.([{ label: 'About project', value: 'about' }]));

    expect(input).toHaveValue('');
    expect(screen.queryByRole('option', optionWithLabel('Alpha project'))).not.toBeInTheDocument();
    expect(screen.queryByRole('option', optionWithLabel('About project'))).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
