import { IOption } from '@/interfaces/common';
import { getProjectsWithParams } from '@/services/projectServices';
import { arrayHasValue, listItemToOption } from '@/utils/common';
import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import { FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
// Build a search parameter with all the choices from the search form

interface IProjectSearchProps {
  onProjectClick: (value: IOption | undefined) => void;
  projectsForSubmit: Array<IOption>;
  onProjectSelectionDelete: (projectName: string) => void;
}

const ProjectProgrammedSearch: FC<IProjectSearchProps> = ({
  onProjectClick,
  projectsForSubmit,
  onProjectSelectionDelete,
}) => {
  const buildQueryParamString = (projectName: string): string => {
    const searchParams = [];
    searchParams.push(`projectName=${projectName}`);
    searchParams.push('phase=5a1f7e80-3cc5-4882-a3b4-035bddcc417b');

    return searchParams.join('&');
  };
  const { t } = useTranslation();
  const [searchWord, setSearchWord] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<Array<IOption>>([]);

  const handleValueChange = useCallback((value: string) => setSearchWord(value), []);

  const getSuggestions = useCallback(
    (inputValue: string) => {
      return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
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
                (project) => !arrayHasValue(projectsIdList, project.id),
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
    },
    [projectsForSubmit],
  );

  const handleSubmit = useCallback((value: string) => {
    const selectedProject = searchedProjects.find((p) => p.label === value);
    if (value) {
      onProjectClick(selectedProject);
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
        onSubmit={(v) => handleSubmit(v)}
      />
      {/* onDelete={(e) => handleDelete(e, onChange)} */}
      <div className="search-selections">
        {projectsForSubmit.map((s) => (
          <Tag key={s.label}>{s.label}</Tag>
        ))}
      </div>
    </div>
  );
};

export default memo(ProjectProgrammedSearch);
