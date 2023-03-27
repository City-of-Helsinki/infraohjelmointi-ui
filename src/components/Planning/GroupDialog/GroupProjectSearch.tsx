import { IOption } from '@/interfaces/common';
import { getProjectsWithParams } from '@/services/projectServices';
import { arrayHasValue, listItemToOption } from '@/utils/common';
import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import _ from 'lodash';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, Controller, UseFormGetValues } from 'react-hook-form';
import { IGroupForm } from '@/interfaces/formInterfaces';
import { ISearchRequest } from '@/interfaces/searchInterfaces';

interface IProjectSearchProps {
  getValues: UseFormGetValues<IGroupForm>;
  control: Control<IGroupForm, any>;
  showAdvanceFields: boolean;
}

const GroupProjectSearch: FC<IProjectSearchProps> = ({ getValues, control, showAdvanceFields }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const buildQueryParamString = (projectName: string): ISearchRequest => {
    const searchParams = Object.entries(getValues())
      .filter(([_, value]) => value?.value)
      .map(([key, value]) => `${key}=${value.value}`);

    searchParams.push(`projectName=${projectName}`);
    searchParams.push('inGroup=false');
    searchParams.push('programmed=false');

    return { limit: '30', params: searchParams.join('&'), order: 'new' };
  };

  const { t } = useTranslation();
  const [searchWord, setSearchWord] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<Array<IOption>>([]);

  const handleValueChange = useCallback((value: string) => setSearchWord(value), []);
  useEffect(() => {
    if (searchedProjects.length > 0 && scrollRef.current) {
      scrollRef.current?.scrollIntoView();
    }
  }, [searchedProjects]);

  const getSuggestions = useCallback(
    (inputValue: string) => {
      if (
        (!showAdvanceFields && getValues('class')?.value) ||
        (showAdvanceFields && getValues('division')?.value && getValues('class')?.value)
      ) {
        return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
          // printing out search params for later
          const queryParams = buildQueryParamString(inputValue);

          getProjectsWithParams(queryParams)
            .then((res) => {
              const projectsIdList = getValues('projectsForSubmit').map((p) => p.value);
              const resultList = res.results?.filter(
                (object) => object.type === 'projects' && !arrayHasValue(projectsIdList, object.id),
              );

              // Convert the resultList to options for the suggestion dropdown
              const searchProjectsItemList: Array<IOption> | [] = resultList
                ? resultList.map((project) => ({
                    ...listItemToOption({ id: project.id, value: project.name }),
                  }))
                : [];
              if (searchProjectsItemList.length > 0) {
                setSearchedProjects(searchProjectsItemList);
              }
              resolve(searchProjectsItemList);
            })
            .catch(() => reject([]));
        });
      } else {
        return new Promise<{ value: string; label: string }[]>((resolve, reject) => resolve([]));
      }
    },
    [getValues, showAdvanceFields],
  );

  const handleSubmit = useCallback(
    (value: string, onChange: (...event: unknown[]) => void) => {
      const selectedProject = searchedProjects.find((p) => p.label === value);
      if (selectedProject?.label) {
        onChange([...getValues('projectsForSubmit'), selectedProject]);
      }

      setSearchWord('');
    },
    [searchedProjects, onchange],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, onChange: (...event: unknown[]) => void) => {
      onChange(
        getValues('projectsForSubmit').filter(
          (p) =>
            p.label !==
            ((e.currentTarget as HTMLButtonElement)?.parentElement?.innerText as string),
        ),
      );
    },
    [onchange, getValues],
  );
  return (
    <div className="dialog-section" data-testid="search-project-field-section">
      <Controller
        name="projectsForSubmit"
        control={control as Control<IGroupForm, any>}
        render={({ field: { onChange } }) => (
          <>
            <SearchInput
              label={t('searchForProjects')}
              getSuggestions={getSuggestions}
              clearButtonAriaLabel="Clear search field"
              searchButtonAriaLabel="Search"
              suggestionLabelField="label"
              helperText={t('groupForm.suggestionHelperText') || ''}
              hideSearchButton={true}
              value={searchWord}
              className="search-input"
              onChange={handleValueChange}
              onSubmit={(v) => handleSubmit(v, onChange)}
            />

            <div className="search-selections-container">
              {getValues('projectsForSubmit').map((s) => (
                <div key={s.label} className={'search-selections'}>
                  <Tag onDelete={(e) => handleDelete(e, onChange)}>{s.label}</Tag>
                </div>
              ))}
            </div>
            <div ref={scrollRef}></div>
          </>
        )}
      />
    </div>
  );
};

export default memo(GroupProjectSearch);
