import { Search } from 'hds-react';
import { ChangeEvent, FC, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ISearchOption {
  label: string;
  value: string;
}

interface IHdsSearchInputProps {
  id?: string;
  'data-testid'?: string;
  className?: string;
  label: string;
  helperText?: string;
  clearButtonAriaLabel?: string;
  searchButtonAriaLabel?: string;
  hideSearchButton?: boolean;
  value?: string;
  getSuggestions?: (inputValue: string) => Promise<ISearchOption[]>;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
}

const HdsSearchInput: FC<IHdsSearchInputProps> = ({
  id,
  'data-testid': dataTestId,
  className,
  label,
  helperText,
  clearButtonAriaLabel,
  searchButtonAriaLabel,
  hideSearchButton,
  value,
  getSuggestions,
  onChange,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const suggestionsRef = useRef<ISearchOption[]>([]);
  const getSuggestionsRef = useRef(getSuggestions);
  const valueRef = useRef(value);
  const searchInputRef = useRef<HTMLInputElement & { submit: () => void }>(null);

  useEffect(() => {
    getSuggestionsRef.current = getSuggestions;
  }, [getSuggestions]);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const handleSearch = useCallback(async (searchValue: string) => {
    const suggestions = (await getSuggestionsRef.current?.(searchValue)) ?? [];
    const options = suggestions.map((option, index) => ({
      ...option,
      value: `${option.value}-${index}`,
    }));
    suggestionsRef.current = suggestions;
    return { options };
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const searchValue = event.target.value;
      if (event.nativeEvent) {
        onChange?.(searchValue);
        return;
      }

      // HDS reports selections and clears with synthetic change events. It also
      // emits a stale value after ordinary typing, which must not replace it.
      if (suggestionsRef.current.some((option) => option.label === searchValue)) {
        suggestionsRef.current = [];
        onChange?.(searchValue);
        onSubmit?.(searchValue);
      } else if (searchInputRef.current?.value === '' && valueRef.current) {
        onChange?.('');
      }
    },
    [onChange, onSubmit],
  );
  const handleSend = useCallback((searchValue: string) => onSubmit?.(searchValue), [onSubmit]);

  return (
    <Search
      id={id}
      data-testid={dataTestId}
      className={className}
      ref={searchInputRef}
      value={value}
      onChange={handleChange}
      onSearch={getSuggestions ? handleSearch : undefined}
      onSend={handleSend}
      hideSubmitButton={hideSearchButton}
      texts={{
        label,
        assistive: helperText,
        searchClearButtonAriaLabel: clearButtonAriaLabel ?? t('clearSearchField', { label }),
        searchButtonAriaLabel,
      }}
    />
  );
};

export default HdsSearchInput;
