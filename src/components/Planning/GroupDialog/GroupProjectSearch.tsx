import { IOption } from '@/interfaces/common';
import { getProjectsWithParams } from '@/services/projectServices';
import { arrayHasValue, listItemToOption } from '@/utils/common';
import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import _ from 'lodash';
import { FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, Controller, UseFormGetValues } from 'react-hook-form';
import { IGroupForm } from '@/interfaces/formInterfaces';
import { ISearchRequest } from '@/interfaces/searchInterfaces';
// Build a search parameter with all the choices from the search form

interface IProjectSearchProps {
  onProjectClick: (value: IOption | undefined) => void;
  projectsForSubmit: Array<IOption>;
  onProjectSelectionDelete: (projectName: string) => void;
  getValues: UseFormGetValues<IGroupForm>;
  control: Control<IGroupForm, any>;
  showAdvanceFields: boolean;
}

const GroupProjectSearch: FC<IProjectSearchProps> = ({
  onProjectClick,
  projectsForSubmit,
  onProjectSelectionDelete,
  getValues,
  control,
  showAdvanceFields,
}) => {
  const buildQueryParamString = (projectName: string): ISearchRequest => {
    const searchParams = [];
    const reqParamObject = { limit: '30', params: '', order: 'new' };
    for (const [key, value] of Object.entries(getValues())) {
      value?.value && searchParams.push(`${key}=${value?.value}`);
    }
    searchParams.push(`projectName=${projectName}`);
    searchParams.push('inGroup=false');
    // searchParams.push('programmed=true');
    reqParamObject.params = searchParams.join('&');
    return reqParamObject;
  };
  const { t } = useTranslation();
  const [searchWord, setSearchWord] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<Array<IOption>>([]);

  const handleValueChange = useCallback((value: string) => setSearchWord(value), []);

  const getSuggestions = useCallback(
    (inputValue: string) => {
      if (
        (!showAdvanceFields && getValues('class')?.value) ||
        (showAdvanceFields && getValues('division')?.value && getValues('class')?.value)
      ) {
        return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
          // printing out search params for later
          const queryParams = buildQueryParamString(inputValue);
          console.log(queryParams);

          getProjectsWithParams(queryParams)
            .then((res) => {
              if (res) {
                console.log(res);
                // Filter out only the projects which haven't yet been added to be the submitted list from the result
                const projectsIdList = projectsForSubmit.map((p) => p.value);
                const resultList = res.results?.filter(
                  (object) =>
                    object.type === 'projects' && !arrayHasValue(projectsIdList, object.id),
                );
                console.log(resultList);

                // Convert the resultList to options for the suggestion dropdown
                const searchProjectsItemList: Array<IOption> | [] = resultList
                  ? resultList.map((project) => ({
                      ...listItemToOption({ id: project.id, value: project.name }),
                    }))
                  : [];
                if (searchProjectsItemList.length > 0) {
                  setSearchedProjects(searchProjectsItemList);
                }
                console.log(searchProjectsItemList);
                resolve(searchProjectsItemList);
              }
              resolve([]);
            })
            .catch(() => reject([]));
        });
      } else {
        return new Promise<{ value: string; label: string }[]>((resolve, reject) => resolve([]));
      }
    },
    [projectsForSubmit, getValues, showAdvanceFields],
  );

  const handleSubmit = useCallback(
    (value: string, onChange: (...event: unknown[]) => void) => {
      const selectedProject = searchedProjects.find((p) => p.label === value);
      console.log(selectedProject);
      if (selectedProject?.label) {
        onProjectClick(selectedProject);
        onChange(projectsForSubmit);
      }
      // value && onProjectClick(searchedProjects.find((p) => p.label === value));
      setSearchWord('');
    },
    [searchedProjects],
  );

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
        // rules={{
        //   validate: {
        //     subClassExists: (_) =>
        //       getValues('subClass')?.value && getValues('subClass').value !== ''
        //         ? true
        //         : 'Populate subClass first',
        //   },
        // }}
        render={({ field: { onChange, value } }) => (
          <>
            <SearchInput
              label={t('searchForProjects')}
              getSuggestions={getSuggestions}
              clearButtonAriaLabel="Clear search field"
              searchButtonAriaLabel="Search"
              suggestionLabelField="label"
              helperText="Täytä pakolliset kentät saadaksesi ehdotuksia"
              hideSearchButton={true}
              value={searchWord}
              onChange={handleValueChange}
              onSubmit={(v) => handleSubmit(v, onChange)}
            />

            <div className="search-selections-container">
              {projectsForSubmit.map((s) => (
                <div key={s.label} className={'search-selections'}>
                  <Tag onDelete={(e) => handleDelete(e, onChange)}>{s.label}</Tag>
                </div>
              ))}
            </div>
          </>
        )}
      />
    </div>
  );
};

export default memo(GroupProjectSearch);
