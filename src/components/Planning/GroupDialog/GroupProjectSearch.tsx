import { IListItem, IOption } from '@/interfaces/common';
import { getProjectsWithParams } from '@/services/projectServices';
import { getLocationParent, listItemToOption } from '@/utils/common';
import { Tag } from 'hds-react';
import { SearchInput } from 'hds-react';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, Controller, UseFormGetValues } from 'react-hook-form';
import { IGroupForm } from '@/interfaces/formInterfaces';
import { useAppSelector } from '@/hooks/common';
import { selectForcedToFrame, selectStartYear } from '@/reducers/planningSlice';
import { IProject } from '@/interfaces/projectInterfaces';
import { selectProjectDivisions, selectProjectSubDivisions } from '@/reducers/listsSlice';

interface IProjectSearchProps {
  getValues: UseFormGetValues<IGroupForm>;
  control: Control<IGroupForm>;
}

export const MULTIPLE_DIVISIONS_LABEL = 'Eri kaupunginosia';
export const MULTIPLE_DISTRICTS_LABEL = 'Eri suurpiirejä';

export interface IProjectSearchFilters {
  lowerCaseSearchWord: string;
  groupSubDivision: string;
  groupDivisionName: string;
  groupDivision: string;
  groupDistrictName: string;
  groupDistrict: string;
  groupSubClass: string;
  groupClass: string;
  projectsForSubmitIds: string[];
}

interface IFilterProjectsForSearchParams {
  projects: IProject[];
  filters: IProjectSearchFilters;
  projectSubDivisions: IListItem[];
  projectDivisions: IListItem[];
}

const getProjectsUnderClass = async (groupClass: string, forcedToFrame: boolean, year: number) => {
  const groupClassParam = groupClass ? `class=${groupClass}` : '';
  const res = await getProjectsWithParams(
    {
      params: groupClassParam + '&inGroup=false',
      direct: false,
      programmed: true,
      forcedToFrame: forcedToFrame,
      year: year,
    },
    false,
  );
  return res.results;
};

const getSearchFilters = (
  getValues: UseFormGetValues<IGroupForm>,
  searchWord: string,
): IProjectSearchFilters => {
  return {
    lowerCaseSearchWord: searchWord.toLowerCase(),
    groupSubDivision: getValues('subDivision.value'),
    groupDivisionName: getValues('division.label'),
    groupDivision: getValues('division.value'),
    groupDistrictName: getValues('district.label'),
    groupDistrict: getValues('district.value'),
    groupSubClass: getValues('subClass.value'),
    groupClass: getValues('class.value'),
    projectsForSubmitIds: getValues('projectsForSubmit').map((project) => project.value),
  };
};

export const filterProjectsForSearch = ({
  projects,
  filters,
  projectSubDivisions,
  projectDivisions,
}: IFilterProjectsForSearchParams) =>
  projects.filter((project) => {
    const projectNameMatches = project.name.toLowerCase().startsWith(filters.lowerCaseSearchWord);
    const classMatches =
      project.projectClass === filters.groupSubClass || project.projectClass === filters.groupClass;

    const projectDivision = getLocationParent(projectSubDivisions, project.projectDistrict);
    const projectDistrict = getLocationParent(projectDivisions, projectDivision);

    const districtMatches =
      project.projectDistrict === filters.groupDistrict ||
      projectDivision === filters.groupDivision ||
      projectDistrict === filters.groupDistrict ||
      filters.groupDistrictName === MULTIPLE_DISTRICTS_LABEL;

    const divisionMatches =
      project.projectDistrict === filters.groupDivision ||
      projectDivision === filters.groupDivision ||
      filters.groupDivisionName === MULTIPLE_DIVISIONS_LABEL;

    const subDivisionMatches = project.projectDistrict === filters.groupSubDivision;
    const projectNotSelectedAlready = !filters.projectsForSubmitIds.includes(project.id);

    if (filters.groupSubDivision) {
      return subDivisionMatches && projectNameMatches && classMatches && projectNotSelectedAlready;
    }

    if (filters.groupDivision) {
      return divisionMatches && projectNameMatches && classMatches && projectNotSelectedAlready;
    }

    if (filters.groupDistrict) {
      return districtMatches && projectNameMatches && classMatches && projectNotSelectedAlready;
    }

    if (filters.groupSubClass || filters.groupClass) {
      return classMatches && projectNameMatches && projectNotSelectedAlready;
    }

    return false;
  });

const GroupProjectSearch: FC<IProjectSearchProps> = ({ getValues, control }) => {
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const scrollRef = useRef<HTMLDivElement>(null);
  const projectSubDivisions = useAppSelector(selectProjectSubDivisions);
  const projectDivisions = useAppSelector(selectProjectDivisions);
  const year = useAppSelector(selectStartYear);
  const { t } = useTranslation();
  const [searchWord, setSearchWord] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<Array<IOption>>([]);
  const [allProjectsUnderSelectedClass, setAllProjectsUnderSelectedClass] = useState<IProject[]>(
    [],
  );

  const handleValueChange = useCallback((value: string) => setSearchWord(value), []);

  const getSuggestions = useCallback(async () => {
    return searchedProjects;
  }, [searchedProjects]);

  const groupClass = getValues('class.value');

  useEffect(() => {
    const setProjectsForSearch = async () => {
      const projects = getProjectsUnderClass(groupClass, forcedToFrame, year);
      setAllProjectsUnderSelectedClass(await projects);
    };
    setProjectsForSearch();
  }, [groupClass, forcedToFrame, year]);

  useEffect(() => {
    const filters = getSearchFilters(getValues, searchWord);
    const projectSearchResult = filterProjectsForSearch({
      projects: allProjectsUnderSelectedClass,
      filters,
      projectSubDivisions,
      projectDivisions,
    });

    const searchProjectsItemList = projectSearchResult.map((project) =>
      listItemToOption({ id: project.id, value: project.name }),
    );
    setSearchedProjects(searchProjectsItemList);
  }, [allProjectsUnderSelectedClass, getValues, projectDivisions, projectSubDivisions, searchWord]);

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
    (e: React.MouseEvent<HTMLDivElement>, onChange: (...event: unknown[]) => void) => {
      onChange(
        getValues('projectsForSubmit').filter(
          (p) =>
            p.label !== ((e.currentTarget as HTMLDivElement)?.parentElement?.innerText as string),
        ),
      );
    },
    [getValues],
  );

  return (
    <div className="dialog-section " data-testid="search-project-field-section">
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
              className="group-form-search-input"
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
                  <Tag
                    aria-label={`delete-project-${s.value}`}
                    onDelete={(e) => {
                      handleDelete(e as React.MouseEvent<HTMLDivElement>, onChange);
                    }}
                  >
                    {s.label}
                  </Tag>
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
