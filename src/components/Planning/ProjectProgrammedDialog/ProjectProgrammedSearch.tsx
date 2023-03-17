import { IOption } from '@/interfaces/common';
import { getProjectsWithParams } from '@/services/projectServices';
import { arrayHasValue, listItemToOption } from '@/utils/common';
import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOptions } from '@/hooks/useOptions';
import { ISearchRequest } from '@/interfaces/searchInterfaces';
import { IClass } from '@/interfaces/classInterfaces';
import { useAppSelector } from '@/hooks/common';
import { selectAllClasses } from '@/reducers/classSlice';
import SelectedProjectCard from './SelectedProjectCard';
// Build a search parameter with all the choices from the search form

interface IProjectSearchProps {
  onProjectClick: (value: ISuggestionItems | undefined) => void;
  projectsForSubmit: Array<ISuggestionItems>;
  onProjectSelectionDelete: (projectName: string) => void;
}

interface ISuggestionItems {
  value: string;
  label: string;
  breadCrumbs: Array<string>;
}
const buildBreadCrumbs = (path: string, classes: Array<IClass>): Array<string> =>
  path.split('/').map((p) => classes.find((c) => c.id === p)?.name || '');

const ProjectProgrammedSearch: FC<IProjectSearchProps> = ({
  onProjectClick,
  projectsForSubmit,
  onProjectSelectionDelete,
}) => {
  const classes = useAppSelector(selectAllClasses);
  const [searchWord, setSearchWord] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<Array<ISuggestionItems>>([]);
  const phase = useOptions('phases', true).find((phase) => phase.label === 'proposal')?.value || '';

  const buildQueryParamString = useCallback(
    (projectName: string): ISearchRequest => {
      const reqParamObject = { limit: '30', params: '', order: 'new' };
      const searchParams = [];
      searchParams.push(`projectName=${projectName}`);
      // searchParams.push(`phase=${phase}`);
      reqParamObject.params = searchParams.join('&');
      return reqParamObject;
    },
    [phase],
  );

  const { t } = useTranslation();

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
              const resultList = res.results.filter(
                (object) => object.type === 'projects' && !arrayHasValue(projectsIdList, object.id),
              );
              console.log(resultList);

              // Convert the resultList to options for the suggestion dropdown
              const searchProjectsItemList: Array<ISuggestionItems> | [] = resultList
                ? resultList.map((project) => ({
                    label: project.name,
                    value: project.id,
                    breadCrumbs: buildBreadCrumbs(project.path, classes),
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
      });
    },
    [projectsForSubmit, buildQueryParamString, buildBreadCrumbs, classes],
  );

  const handleSubmit = useCallback(
    (value: string) => {
      const selectedProject = searchedProjects.find((p) => p.label === value);
      console.log(selectedProject);
      if (value) {
        onProjectClick(selectedProject);
      }
      // value && onProjectClick(searchedProjects.find((p) => p.label === value));
      setSearchWord('');
    },
    [onProjectClick, searchedProjects],
  );

  const handleDelete = useCallback(
    (name: string) => {
      onProjectSelectionDelete(name);
    },
    [onProjectSelectionDelete, projectsForSubmit],
  );
  return (
    <div className="project-search-input" data-testid="search-project-field-section">
      <SearchInput
        label={t('searchForProjects')}
        getSuggestions={getSuggestions}
        clearButtonAriaLabel="Clear search field"
        searchButtonAriaLabel="Search"
        suggestionLabelField="label"
        value={searchWord}
        onChange={handleValueChange}
        onSubmit={(v) => handleSubmit(v)}
      />
      {/* onDelete={(e) => handleDelete(e, onChange)} */}
      <div className="search-selections">
        {projectsForSubmit.map((s) => (
          <SelectedProjectCard
            name={s.label}
            breadCrumbs={s.breadCrumbs}
            key={s.label}
            handleDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(ProjectProgrammedSearch);
