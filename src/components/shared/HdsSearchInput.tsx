import { Search } from 'hds-react';
import { ChangeEvent, FC, MouseEvent, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ISearchOption {
  label: string;
  value: string;
}

interface ISearchState {
  value: string;
  options: ISearchOption[];
  requestId: number;
}

type HdsSearchChangeEvent =
  ChangeEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement> | { target: { value: string } };

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
  const searchStateRef = useRef<ISearchState>({
    value: value ?? '',
    options: [],
    requestId: 0,
  });
  const getSuggestionsRef = useRef(getSuggestions);

  useEffect(() => {
    getSuggestionsRef.current = getSuggestions;
  }, [getSuggestions]);
  useEffect(() => {
    if (value !== undefined && searchStateRef.current.value !== value) {
      searchStateRef.current = {
        value,
        options: [],
        requestId: searchStateRef.current.requestId + 1,
      };
    }
  }, [value]);
  useEffect(
    () => () => {
      searchStateRef.current.requestId += 1;
      searchStateRef.current.options = [];
    },
    [],
  );

  const handleSearch = useCallback(async (searchValue: string) => {
    const requestId = ++searchStateRef.current.requestId;
    try {
      const suggestions = (await getSuggestionsRef.current?.(searchValue)) ?? [];
      if (
        requestId === searchStateRef.current.requestId &&
        searchValue === searchStateRef.current.value
      ) {
        searchStateRef.current.options = suggestions.map((option, index) => ({
          ...option,
          value: `${option.value}-${index}`,
        }));
      }
    } catch (error) {
      if (requestId === searchStateRef.current.requestId) throw error;
    }
    return { options: searchStateRef.current.options };
  }, []);

  const updateValue = useCallback(
    (nextValue: string) => {
      searchStateRef.current = {
        value: nextValue,
        options: [],
        requestId: searchStateRef.current.requestId + 1,
      };
      onChange?.(nextValue);
    },
    [onChange],
  );

  const handleChange = useCallback(
    (event: HdsSearchChangeEvent) => {
      if ('type' in event) {
        if (event.type === 'change') updateValue(event.currentTarget.value);
        if (event.type === 'click') updateValue('');
        return;
      }

      // HDS 5.2.2 Search's input effect reports internal search/value mismatches as
      // { target: { value: internalSearch } }, without a React event. Selection
      // updates internalSearch through this same path. Only current suggestions
      // may be submitted; typing clears them before HDS can echo the old text.
      const selectedLabel = event.target.value;
      if (searchStateRef.current.options.some((option) => option.label === selectedLabel)) {
        updateValue(selectedLabel);
        onSubmit?.(selectedLabel);
      }
    },
    [updateValue, onSubmit],
  );

  return (
    <Search
      id={id}
      data-testid={dataTestId}
      className={className}
      value={value}
      onChange={handleChange}
      onSearch={getSuggestions ? handleSearch : undefined}
      onSend={onSubmit}
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
