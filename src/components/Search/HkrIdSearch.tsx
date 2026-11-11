import { Checkbox, Tag } from 'hds-react';
import HdsSearchInput from '@/components/shared/HdsSearchInput';
import { memo, useCallback, MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { arrayHasValue } from '@/utils/common';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { Control, Controller, UseFormGetValues, UseFormSetValue, useWatch } from 'react-hook-form';
import './styles.css';

interface IHkrIdSearchState {
  searchWord: string;
}

const HkrIdSearch = ({
  control,
  getValues,
  setValue,
}: {
  control: Control<ISearchForm>;
  getValues: UseFormGetValues<ISearchForm>;
  setValue: UseFormSetValue<ISearchForm>;
}) => {
  const { t } = useTranslation();
  const [searchState, setSearchState] = useState<IHkrIdSearchState>({
    searchWord: '',
  });
  const { searchWord } = searchState;
  const withoutHkrId = useWatch({ control, name: 'withoutHkrId' });

  const validateHkrId = (id: string) => {
    return id && id.length < 6;
  };

  const handleSubmit = useCallback(
    (value: string, onChange: (...event: unknown[]) => void) => {
      if (getValues('withoutHkrId')) return;
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
        control={control}
        render={({ field: { onChange, value } }) => (
          <>
            <HdsSearchInput
              className="hkr-id-search-input"
              label={t('searchForm.hkrIdSearch')}
              disabled={withoutHkrId}
              maxLength={5}
              value={searchWord}
              onChange={handleSetSearchWord}
              onSubmit={(value) => handleSubmit(value.trim(), onChange)}
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
      <Controller
        name="withoutHkrId"
        control={control}
        render={({ field }) => (
          <div className="input-wrapper without-hkr-id-search">
            <Checkbox
              id={field.name}
              name={field.name}
              label={t('searchForm.withoutHkrId')}
              checked={field.value}
              onBlur={field.onBlur}
              onChange={(event) => {
                if (event.target.checked) {
                  setValue('hkrIds', [], { shouldDirty: true });
                  setSearchState((current) => ({
                    ...current,
                    searchWord: '',
                    selections: [],
                  }));
                }
                field.onChange(event.target.checked);
              }}
            />
          </div>
        )}
      />
    </div>
  );
};

export default memo(HkrIdSearch);
