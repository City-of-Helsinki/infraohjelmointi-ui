import { Search } from 'hds-react';
import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
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
  disabled?: boolean;
  maxLength?: number;
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
  disabled,
  maxLength,
  value,
  getSuggestions,
  onChange,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const searchClearButtonAriaLabel = clearButtonAriaLabel ?? t('clearSearchField', { label });
  const texts = useMemo(
    () => ({
      label,
      assistive: helperText,
      searchClearButtonAriaLabel,
      searchButtonAriaLabel,
    }),
    [label, helperText, searchClearButtonAriaLabel, searchButtonAriaLabel],
  );
  const getSuggestionsRef = useRef(getSuggestions);
  const onChangeRef = useRef(onChange);
  const onSubmitRef = useRef(onSubmit);
  const valueRef = useRef(value);
  const selectedOptionRef = useRef<string | undefined>(undefined);

  const setInputMaxLength = useCallback(
    (container: HTMLFieldSetElement | null) => {
      const input = container?.querySelector('input');
      if (!input) return;
      if (maxLength === undefined) input.removeAttribute('maxlength');
      else input.maxLength = maxLength;
    },
    [maxLength],
  );

  useEffect(() => {
    getSuggestionsRef.current = getSuggestions;
    onChangeRef.current = onChange;
    onSubmitRef.current = onSubmit;
    valueRef.current = value;
  }, [getSuggestions, onChange, onSubmit, value]);

  const handleSearch = useCallback(async (searchValue: string) => {
    selectedOptionRef.current = undefined;
    const suggestions = (await getSuggestionsRef.current?.(searchValue)) ?? [];
    if (valueRef.current !== undefined && valueRef.current !== searchValue) {
      return { options: [] };
    }
    return {
      options: suggestions.map((option, index) => ({
        ...option,
        value: `${option.value}-${index}`,
      })),
    };
  }, []);

  const searchInput = (
    <Search
      id={id}
      data-testid={dataTestId}
      className={className}
      disabled={disabled}
      value={value}
      onChange={(event) => event.type && onChange?.(event.target.value)}
      onSearch={getSuggestions ? handleSearch : undefined}
      onClose={(selectedOptions) => {
        const [selectedOption] = selectedOptions;
        if (selectedOption && selectedOption.value !== selectedOptionRef.current) {
          selectedOptionRef.current = selectedOption.value;
          onChangeRef.current?.(selectedOption.label);
          onSubmitRef.current?.(selectedOption.label);
        }
      }}
      onSend={onSubmit}
      hideSubmitButton={hideSearchButton}
      texts={texts}
    />
  );

  return disabled === undefined && maxLength === undefined ? (
    searchInput
  ) : (
    <fieldset
      ref={setInputMaxLength}
      disabled={disabled}
      inert={disabled}
      className="m-0 min-w-0 border-0 p-0"
    >
      {searchInput}
    </fieldset>
  );
};

export default HdsSearchInput;
