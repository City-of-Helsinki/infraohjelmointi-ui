import { IOption } from '@/interfaces/common';
import { getProjectsWithParams } from '@/services/projectServices';
import { getLocationParent, listItemToOption } from '@/utils/common';
import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
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

const getProjectsUnderClassOrSubClass = async (
  groupSubClass: string,
  groupClass: string,
  forcedToFrame: boolean,
  year: number,
) => {
  const groupClassParam = groupClass ? `class=${groupClass}` : '';
  const classParam = groupSubClass ? `subClass=${groupSubClass}` : groupClassParam;
  const res = await getProjectsWithParams(
    {
      params: classParam + '&inGroup=false',
      direct: false,
      programmed: true,
      forcedToFrame: forcedToFrame,
      year: year,
    },
    false,
  );
  return res.results;
};

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

  useEffect(() => {
    const setProjectsForSearch = async () => {
      const groupClass = getValues('class.value');
      const groupSubClass = getValues('subClass.value');
      const projects = getProjectsUnderClassOrSubClass(
        groupSubClass,
        groupClass,
        forcedToFrame,
        year,
      );
      setAllProjectsUnderSelectedClass(await projects);
    };
    setProjectsForSearch();
  }, [getValues('class.value'), getValues('subClass.value')]);

  useEffect(() => {
    const lowerCaseSearchWord = searchWord.toLowerCase();
    const groupSubDivision = getValues('subDivision.value');
    const groupDivisionName = getValues('division.label');
    // If selected groupDivision is Eri kaupunginosia (= Different divisions) it means that there is no specific division selected
    // and the search should work as if there's no division selected
    const groupDivision =
      groupDivisionName === 'Eri kaupunginosia' ? undefined : getValues('division.value');
    const groupDistrictName = getValues('district.label');
    // If selected groupDistrict is Eri suurpiirejä (= Different districts) it's the same as if there was no groupDivision selected
    const groupDistrict =
      groupDistrictName === 'Eri suurpiirejä' ? undefined : getValues('district.value');
    const groupSubClass = getValues('subClass.value');
    const groupClass = getValues('class.value');
    const projectsForSubmitIds = getValues('projectsForSubmit').map((project) => project.value);

    const projectSearchResult = allProjectsUnderSelectedClass.filter((project) => {
      const projectNameMatches = project.name.toLowerCase().startsWith(lowerCaseSearchWord);
      const classMatches =
        project.projectClass === groupSubClass || project.projectClass === groupClass;
      const districtMatches =
        project.projectDistrict === groupDistrict ||
        getLocationParent(projectSubDivisions, project.projectDistrict) === groupDivision ||
        getLocationParent(
          projectDivisions,
          getLocationParent(projectSubDivisions, project.projectDistrict),
        ) === groupDivision;
      const divisionMatches =
        project.projectDistrict === groupDivision ||
        getLocationParent(projectSubDivisions, project.projectDistrict) === groupDivision;
      const subDivisionMatches = project.projectDistrict === groupSubDivision;
      const projectNotSelectedAlready = !projectsForSubmitIds.includes(project.id);

      if (groupSubDivision)
        return (
          subDivisionMatches && projectNameMatches && classMatches && projectNotSelectedAlready
        );
      else if (groupDivision)
        return divisionMatches && projectNameMatches && classMatches && projectNotSelectedAlready;
      else if (groupDistrict)
        return districtMatches && projectNameMatches && classMatches && projectNotSelectedAlready;
      else if (groupSubClass || groupClass) {
        return classMatches && projectNameMatches && projectNotSelectedAlready;
      }
      return false;
    });

    const searchProjectsItemList = projectSearchResult.map((project) => ({
      ...listItemToOption({ id: project.id, value: project.name }),
    }));
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
