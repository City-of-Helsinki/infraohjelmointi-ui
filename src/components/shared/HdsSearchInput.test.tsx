import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from 'hds-react';
import { useState } from 'react';
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
}: {
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  getSuggestions?: (query: string) => Promise<SearchOption[]>;
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
        onSubmit={onSubmit}
        getSuggestions={getSuggestions}
      />
      <button type="button" onClick={() => setValue('')}>
        Reset external value
      </button>
    </>
  );
};

describe('HdsSearchInput with real HDS', () => {
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
    await screen.findByText('Alpha project');
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
    await screen.findByText('Alpha');
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
    const option = await screen.findByText('Alpha project');
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
    await screen.findByText('Alpha project');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Al');

    await user.click(input);
    await user.click(await screen.findByText('Alpha project'));

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
    await screen.findByText('Beta project');
    await act(async () => pending.get('a')?.(options));
    expect(screen.queryByText('Alpha project')).not.toBeInTheDocument();
    await user.click(screen.getByText('Beta project'));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Beta project');
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
      expect(screen.queryByText('Alpha project')).not.toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    },
  );
});
