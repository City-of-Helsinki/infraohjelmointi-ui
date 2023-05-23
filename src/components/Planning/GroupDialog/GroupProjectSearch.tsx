import { IOption } from '@/interfaces/common';
import { getProjectsWithParams } from '@/services/projectServices';
import { arrayHasValue, listItemToOption } from '@/utils/common';
import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, Controller, UseFormGetValues } from 'react-hook-form';
import { IGroupForm } from '@/interfaces/formInterfaces';
import { IProjectSearchRequest } from '@/interfaces/searchInterfaces';

interface IProjectSearchProps {
  getValues: UseFormGetValues<IGroupForm>;
  control: Control<IGroupForm, any>;
  showAdvanceFields: boolean;
  divisions: IOption[];
}

const GroupProjectSearch: FC<IProjectSearchProps> = ({
  getValues,
  control,
  showAdvanceFields,
  divisions,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const buildQueryParamString = useCallback(
    (projectName: string): IProjectSearchRequest => {
      const searchParams = [];

      searchParams.push(`subClass=${getValues('subClass').value}`);
      if (getValues('subDivision').value) {
        searchParams.push(`subDivision=${getValues('subDivision').value}`);
      } else if (getValues('division').value) {
        searchParams.push(`division=${getValues('division').value}`);
      } else if (getValues('district').value) {
        searchParams.push(`district=${getValues('district').value}`);
      }
      searchParams.push(`projectName=${projectName}`);
      searchParams.push('inGroup=false');
      searchParams.push('programmed=true');

      return { params: searchParams.join('&'), direct: !showAdvanceFields };
    },
    [getValues, showAdvanceFields],
  );

  const { t } = useTranslation();
  const [searchWord, setSearchWord] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<Array<IOption>>([]);

  const handleValueChange = useCallback((value: string) => setSearchWord(value), []);

  const getSuggestions = useCallback(
    (inputValue: string) => {
      if (
        (showAdvanceFields &&
          (!getValues('district')?.value ||
            (divisions.length > 0 && !getValues('division')?.value) ||
            !getValues('subClass')?.value)) ||
        (!showAdvanceFields && !getValues('subClass')?.value)
      ) {
        return Promise.resolve([]);
      }
      return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
        // printing out search params for later
        const queryParams = buildQueryParamString(inputValue);
        getProjectsWithParams(queryParams)
          .then((res) => {
            const projectsIdList = getValues('projectsForSubmit').map((p) => p.value);
            const resultList = res.results?.filter(
              (project) => !arrayHasValue(projectsIdList, project.id),
            );

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
    },
    [getValues, showAdvanceFields, buildQueryParamString, divisions],
  );

  const handleSubmit = useCallback(
    (value: string, onChange: (...event: unknown[]) => void) => {
      const selectedProject = searchedProjects.find((p) => p.label === value);
      if (selectedProject?.label) {
        onChange([...getValues('projectsForSubmit'), selectedProject]);
      }

      setSearchWord('');
    },
    [searchedProjects, getValues],
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
    [getValues],
  );
  return (
    <div
      className="dialog-section group-form-search-input"
      data-testid="search-project-field-section"
    >
      <Controller
        name="projectsForSubmit"
        control={control}
        render={({ field: { onChange } }) => (
          <>
            <SearchInput
              label={t('groupForm.searchForProjects')}
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
                <div
                  key={s.label}
                  className={'search-selections'}
                  data-testid={'project-selections'}
                >
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
