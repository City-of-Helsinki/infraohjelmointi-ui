import { Tag } from 'hds-react';
import { SearchInput } from 'hds-react';
import { memo, useCallback, useState, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { arrayHasValue } from '@/utils/common';
import { HookFormControlType, ISearchForm } from '@/interfaces/formInterfaces';
import { Control, Controller, FieldValues, UseFormGetValues } from 'react-hook-form';
import './styles.css';

interface IHkrIdSearchState {
  searchWord: string;
}

const HkrIdSearch = ({
  control,
  getValues,
}: {
  control: HookFormControlType;
  getValues: UseFormGetValues<ISearchForm>;
}) => {
  const { t } = useTranslation();

  const [searchState, setSearchState] = useState<IHkrIdSearchState>({
    searchWord: '',
  });

  const { searchWord } = searchState;

  const validateHkrId = (id: string) => {
    return id && id.length < 6;
  };

  const handleSubmit = useCallback(
    (value: string, onChange: (...event: unknown[]) => void) => {
      const formValue = getValues('hkrIds');
      if (!arrayHasValue(formValue, value) && validateHkrId(value)) {
        const nextChange = [...formValue, value];
        onChange(nextChange);
        setSearchState((current) => {
          return {
            ...current,
            searchWord: '',
            selections: nextChange,
          };
        });
      }
    },
    [getValues],
  );

  const onSelectionDelete = useCallback(
    (e: MouseEvent<HTMLDivElement | HTMLButtonElement>, onChange: (event: string[]) => void) => {
      const targetText = e.currentTarget?.innerText || '';
      const formValue = getValues('hkrIds');

      const nextChange = formValue.filter((item) => item !== targetText);

      if (nextChange.length !== formValue.length) {
        onChange(nextChange);
        setSearchState((current) => ({
          ...current,
          selections: nextChange,
        }));
      }
    },
    [getValues, setSearchState],
  );

  const handleSetSearchWord = useCallback(
    (value: string) =>
      setSearchState((current) => {
        return { ...current, searchWord: value };
      }),
    [],
  );

  return (
    <div className="hkr-id-search" data-testid="hkr-id-search">
      <Controller
        name="hkrIds"
        control={control as Control<FieldValues>}
        render={({ field: { onChange, value } }) => (
          <>
            <SearchInput
              label={t('searchForm.hkrIdSearch')}
              value={searchWord}
              onChange={handleSetSearchWord}
              onSubmit={(v) => handleSubmit(v, onChange)}
            />
            <div className="hkr-id-search-selections">
              {(Array.isArray(value) ? value : []).map((s) => (
                <Tag
                  key={s}
                  onDelete={(e) => {
                    onSelectionDelete(e as React.MouseEvent<HTMLDivElement>, onChange);
                  }}
                >
                  {s}
                </Tag>
              ))}
            </div>
          </>
        )}
      />
    </div>
  );
};

export default memo(HkrIdSearch);
