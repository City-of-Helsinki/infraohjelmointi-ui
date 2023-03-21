import { getProjectsWithParams } from '@/services/projectServices';
import { arrayHasValue } from '@/utils/common';
import { SearchInput } from 'hds-react/components/SearchInput';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOptions } from '@/hooks/useOptions';
import { IProgrammedProjectSuggestions, ISearchRequest } from '@/interfaces/searchInterfaces';
import { IClass } from '@/interfaces/classInterfaces';
import { useAppSelector } from '@/hooks/common';
import {
  selectAllClasses,
  selectSelectedClass,
  selectSelectedSubClass,
} from '@/reducers/classSlice';
import SelectedProjectCard from './SelectedProjectCard';
// Build a search parameter with all the choices from the search form

interface IProjectSearchProps {
  onProjectClick: (value: IProgrammedProjectSuggestions | undefined) => void;
  projectsForSubmit: Array<IProgrammedProjectSuggestions>;
  onProjectSelectionDelete: (projectName: string) => void;
}

const buildBreadCrumbs = (path: string, classes: Array<IClass>): Array<string> =>
  path.split('/').map((p) => classes.find((c) => c.id === p)?.name || '');

const ProjectProgrammedSearch: FC<IProjectSearchProps> = ({
  onProjectClick,
  projectsForSubmit,
  onProjectSelectionDelete,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const classes = useAppSelector(selectAllClasses);
  const [searchWord, setSearchWord] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<Array<IProgrammedProjectSuggestions>>(
    [],
  );
  const phase = useOptions('phases', true).find((phase) => phase.label === 'proposal')?.value || '';
  const selectedClass = useAppSelector(selectSelectedClass);
  const selectedSubClass = useAppSelector(selectSelectedSubClass);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView();
    }, 2000);
  }, [searchedProjects]);

  const buildQueryParamString = useCallback(
    (projectName: string): ISearchRequest => {
      const reqParamObject = { limit: '30', params: '', order: 'new' };
      const searchParams = [];
      searchParams.push(`projectName=${projectName}`);
      searchParams.push(`phase=${phase}`);
      searchParams.push(`programmed=false`);
      selectedSubClass?.id
        ? searchParams.push(`subClass=${selectedSubClass.id}`)
        : selectedClass?.id
        ? searchParams.push(`class=${selectedClass.id}`)
        : '';

      reqParamObject.params = searchParams.join('&');
      return reqParamObject;
    },
    [phase, selectedSubClass, selectedClass],
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
              const searchProjectsItemList: Array<IProgrammedProjectSuggestions> | [] = resultList
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
      <div ref={scrollRef}></div>
    </div>
  );
};

export default memo(ProjectProgrammedSearch);
