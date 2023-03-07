import { FreeSearchFormItem, IFreeSearchResult, IListItem, IOption } from '@/interfaces/common';
import { getProjectsWithFreeSearch, getProjectsWithParams } from '@/services/projectServices';
import { arrayHasValue, listItemToOption } from '@/utils/common';
import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import _ from 'lodash';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, Controller, FieldValues, UseFormGetValues } from 'react-hook-form';
import { IGroupForm } from '@/interfaces/formInterfaces';
// Build a search parameter with all the choices from the search form

interface IProjectSearchProps {
  onProjectClick: (value: IOption | undefined) => void;
  projectsForSubmit: Array<IOption>;
  onProjectSelectionDelete: (projectName: string) => void;
  getValues: UseFormGetValues<IGroupForm>;
  control: Control<IGroupForm, any>;
}

interface IQueryParamsState {
  masterClass: string;
  class: string;
  subClass: string;
  district: string;
  division: string;
  subDivision: string;
}

const GroupProjectSearch: FC<IProjectSearchProps> = ({
  onProjectClick,
  projectsForSubmit,
  onProjectSelectionDelete,
  getValues,
  control,
}) => {
  const buildQueryParamString = (projectName: string): string => {
    const searchParams = [];
    for (const [key, value] of Object.entries(getValues())) {
      value?.value && searchParams.push(`${key}=${value?.value}`);
    }
    searchParams.push(`projectName=${projectName}`);
    searchParams.push(`limit=30`);
    searchParams.push('inGroup=false');
    searchParams.push('programmed=true');

    return searchParams.join('&');
  };
  const { t } = useTranslation();
  const [searchWord, setSearchWord] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<Array<IOption>>([]);

  const handleValueChange = useCallback((value: string) => setSearchWord(value), []);

  const getSuggestions = useCallback(
    (inputValue: string) =>
      new Promise<{ value: string; label: string }[]>((resolve, reject) => {
        // printing out search params for later
        const queryString = buildQueryParamString(inputValue);
        console.log(queryString);

        getProjectsWithParams(queryString)
          .then((res) => {
            if (res) {
              console.log(res);
              // Filter out only the projects which haven't yet been added to be the submitted list from the result
              const projectsIdList = projectsForSubmit.map((p) => p.value);
              const resultList = res.projects?.filter(
                ({ project }) => !arrayHasValue(projectsIdList, project.id),
              );
              console.log(resultList);

              // Convert the resultList to options for the suggestion dropdown
              const searchProjectsItemList: Array<IOption> | [] = resultList
                ? resultList.map(({ project }) => ({
                    ...listItemToOption({ id: project.id, value: project.name }),
                  }))
                : [];
              if (searchProjectsItemList.length > 0) {
                setSearchedProjects(searchProjectsItemList);
              }

              resolve(searchProjectsItemList);
            }
            resolve([]);
          })
          .catch(() => reject([]));
      }),
    [projectsForSubmit, getValues],
  );

  const handleSubmit = useCallback((value: string, onChange: (...event: unknown[]) => void) => {
    const selectedProject = searchedProjects.find((p) => p.label === value);
    if (value) {
      onProjectClick(selectedProject);
      onChange(projectsForSubmit);
    }
    // value && onProjectClick(searchedProjects.find((p) => p.label === value));
    setSearchWord('');
  }, []);

  const handleDelete = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, onChange: (...event: unknown[]) => void) => {
      onProjectSelectionDelete(
        (e.currentTarget as HTMLButtonElement)?.parentElement?.innerText as string,
      );
      onChange(projectsForSubmit);
    },
    [],
  );
  return (
    <div className="dialog-section" data-testid="search-project-field-section">
      <Controller
        name="projectsForSubmit"
        control={control as Control<IGroupForm, any>}
        render={({ field: { onChange, value } }) => (
          <>
            <SearchInput
              label={t('searchForProjects')}
              getSuggestions={getSuggestions}
              clearButtonAriaLabel="Clear search field"
              searchButtonAriaLabel="Search"
              suggestionLabelField="label"
              value={searchWord}
              onChange={handleValueChange}
              onSubmit={(v) => handleSubmit(v, onChange)}
            />

            <div className="search-selections">
              {projectsForSubmit.map((s) => (
                <Tag key={s.label} onDelete={(e) => handleDelete(e, onChange)}>
                  {s.label}
                </Tag>
              ))}
            </div>
          </>
        )}
      />
    </div>
  );
};

export default memo(GroupProjectSearch);
