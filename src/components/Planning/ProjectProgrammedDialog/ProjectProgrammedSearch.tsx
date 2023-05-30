import { getSearchResults } from '@/services/projectServices';
import { arrayHasValue } from '@/utils/common';
import { SearchInput } from 'hds-react/components/SearchInput';
import { FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOptions } from '@/hooks/useOptions';
import { IProgrammedProjectSuggestions, ISearchRequest } from '@/interfaces/searchInterfaces';
import { IClass } from '@/interfaces/classInterfaces';
import { useAppSelector } from '@/hooks/common';
import { selectAllClasses } from '@/reducers/classSlice';
import SelectedProjectCard from './SelectedProjectCard';
import usePlanningRows from '@/hooks/usePlanningRows';
import { selectDistricts } from '@/reducers/locationSlice';
import { ILocation } from '@/interfaces/locationInterfaces';

interface ISearchState {
  searchWord: string;
  searchedProjects: Array<IProgrammedProjectSuggestions>;
}
interface IProjectSearchProps {
  onProjectClick: (value: IProgrammedProjectSuggestions | undefined) => void;
  projectsForSubmit: Array<IProgrammedProjectSuggestions>;
  onProjectSelectionDelete: (projectName: string) => void;
}

const buildBreadCrumbs = (
  path: string,
  classes: Array<IClass>,
  districts: Array<ILocation>,
): Array<string> =>
  path
    .split('/')
    .map(
      (p) => classes.find((c) => c.id === p)?.name ?? districts.find((d) => d.id === p)?.name ?? '',
    );
const ProjectProgrammedSearch: FC<IProjectSearchProps> = ({
  onProjectClick,
  projectsForSubmit,
  onProjectSelectionDelete,
}) => {
  const classes = useAppSelector(selectAllClasses);
  const districts = useAppSelector(selectDistricts);

  const [searchState, setSearchState] = useState<ISearchState>({
    searchWord: '',
    searchedProjects: [],
  });
  const { searchedProjects, searchWord } = searchState;
  const phaseProposal =
    useOptions('phases', true).find((phase) => phase.label === 'proposal')?.value || '';
  const phaseDesign =
    useOptions('phases', true).find((phase) => phase.label === 'design')?.value || '';

  // selectedClass and selectedSubClass refer to the class and/or subclass currently selected by the user
  // in planning view
  // any one of these classes have to be selected by the user to be able to toggle the form
  const { selections } = usePlanningRows();

  const buildQueryParamString = useCallback(
    (projectName: string): ISearchRequest => {
      const reqParamObject = { limit: '30', params: '', order: 'new' };
      const searchParams = [
        `projectName=${projectName}`,
        `programmed=false`,
        `phase=${phaseProposal}`,
        `phase=${phaseDesign}`,
      ];

      if (selections.selectedSubClass?.id) {
        searchParams.push(`subClass=${selections.selectedSubClass.id}`);
      } else if (selections.selectedClass?.id) {
        searchParams.push(`class=${selections.selectedClass.id}`);
      }

      reqParamObject.params = searchParams.join('&');
      return reqParamObject;
    },
    [selections.selectedSubClass, selections.selectedClass, phaseDesign, phaseProposal],
  );

  const { t } = useTranslation();

  const handleValueChange = useCallback(
    (value: string) => setSearchState((current) => ({ ...current, searchWord: value })),
    [],
  );

  const getSuggestions = useCallback(
    (inputValue: string) => {
      return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
        const queryString = buildQueryParamString(inputValue);

        getSearchResults(queryString)
          .then((res) => {
            // Filter out only the projects which haven't yet been added to be the submitted list from the result
            const projectsIdList = projectsForSubmit.map((p) => p.value);
            const resultList = res.results.filter(
              (result) => result.type == 'projects' && !arrayHasValue(projectsIdList, result.id),
            );

            // Convert the resultList to options for the suggestion dropdown
            const searchProjectsItemList: Array<IProgrammedProjectSuggestions> | [] = resultList
              ? resultList.map((project) => ({
                  label: project.name,
                  value: project.id,
                  breadCrumbs: buildBreadCrumbs(project.path, classes, districts),
                }))
              : [];
            if (searchProjectsItemList.length > 0) {
              setSearchState((current) => ({
                ...current,
                searchedProjects: searchProjectsItemList,
              }));
            }

            resolve(searchProjectsItemList);
          })
          .catch(() => reject([]));
      });
    },
    [projectsForSubmit, buildQueryParamString, classes, districts],
  );

  const handleSubmit = useCallback(
    (value: string) => {
      console.log(value);
      const selectedProject = searchedProjects.find(
        (p) => p.label.toLowerCase() === value.toLowerCase(),
      );

      if (value) {
        onProjectClick(selectedProject);
      }

      setSearchState((current) => ({ ...current, searchWord: '' }));
    },
    [onProjectClick, searchedProjects],
  );

  const handleDelete = useCallback(
    (name: string) => {
      onProjectSelectionDelete(name);
    },
    [onProjectSelectionDelete],
  );
  return (
    <div className="project-search-input" data-testid="search-project-field-section">
      <SearchInput
        label={t('projectProgrammedForm.searchForProjects')}
        data-testid="search-projects-input"
        getSuggestions={getSuggestions}
        clearButtonAriaLabel="Clear search field"
        searchButtonAriaLabel="Search"
        suggestionLabelField="label"
        value={searchWord}
        onChange={handleValueChange}
        onSubmit={handleSubmit}
      />

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
