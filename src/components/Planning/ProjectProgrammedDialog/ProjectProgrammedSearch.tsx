import { getSearchResults } from '@/services/projectServices';
import { arrayHasValue } from '@/utils/common';
import { SearchInput } from 'hds-react';
import { FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOptions } from '@/hooks/useOptions';
import {
  IProgrammedProjectSuggestions,
  ISearchRequest,
  ISearchResultPayloadItem,
} from '@/interfaces/searchInterfaces';
import { IClass } from '@/interfaces/classInterfaces';
import { useAppSelector } from '@/hooks/common';
import { selectAllPlanningClasses } from '@/reducers/classSlice';
import SelectedProjectCard from './SelectedProjectCard';
import { selectPlanningDistricts } from '@/reducers/locationSlice';
import { ILocation } from '@/interfaces/locationInterfaces';
import { selectSelections } from '@/reducers/planningSlice';

interface ISearchState {
  searchWord: string;
  searchedProjects: Array<IProgrammedProjectSuggestions>;
}
interface IProjectSearchProps {
  onProjectsSelect: (value: IProgrammedProjectSuggestions[]) => void;
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
  onProjectsSelect,
  projectsForSubmit,
  onProjectSelectionDelete,
}) => {
  const classes = useAppSelector(selectAllPlanningClasses);
  const districts = useAppSelector(selectPlanningDistricts);

  const [searchState, setSearchState] = useState<ISearchState>({
    searchWord: '',
    searchedProjects: [],
  });
  const { searchedProjects, searchWord } = searchState;
  const phases = useOptions('phases');
  const phaseProposal = phases.find((phase) => phase.label === 'proposal')?.value || '';
  const phaseDesign = phases.find((phase) => phase.label === 'design')?.value || '';

  // selectedClass and selectedSubClass refer to the class and/or subclass currently selected by the user
  // in planning view
  // any one of these classes have to be selected by the user to be able to toggle the form
  const selections = useAppSelector(selectSelections);

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
    async (inputValue: string) => {
      try {
        const queryString = buildQueryParamString(inputValue);

        const res = await getSearchResults(queryString);

        // Filter out only the projects which haven't yet been added to be the submitted list from the result
        const projectsIdList = projectsForSubmit.map((p) => p.value);

        const resultListWithDuplicates = res.results.filter(
          (result) => result.type == 'projects' && !arrayHasValue(projectsIdList, result.id),
        );

        // reset duplicates
        const resultList = Object.values(
          resultListWithDuplicates.reduce((accumulator, current) => {
            // kep only one copy of each element
            return { ...accumulator, [current.name]: current };
          }, {} as Record<string, ISearchResultPayloadItem>),
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

        return searchProjectsItemList;
      } catch (e) {
        console.log('Error getting project suggestions: ', e);
        return [];
      }
    },
    [projectsForSubmit, buildQueryParamString, classes, districts],
  );

  const handleSubmit = useCallback(
    (value: string) => {
      const searchedString = value.toLowerCase();
      const selectedProjects = searchedProjects.filter((p) =>
        p.label.toLowerCase().includes(searchedString),
      );

      onProjectsSelect(selectedProjects);

      setSearchState((current) => ({ ...current, searchWord: '' }));
    },
    [onProjectsSelect, searchedProjects],
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
