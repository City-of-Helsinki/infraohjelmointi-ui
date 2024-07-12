import { IListItem, IOption } from '@/interfaces/common';
import { getProjectsWithParams } from '@/services/projectServices';
import { listItemToOption } from '@/utils/common';
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

const getProjectsUnderClassOrSubClass = async (groupSubClass: string, groupClass: string, forcedToFrame: boolean, year: number) => {
  const res = await getProjectsWithParams({
    params: (groupSubClass ? `subClass=${groupSubClass}`: groupClass ? `class=${groupClass}` : '') + "&inGroup=false",
    direct: false,
    programmed: true,
    forcedToFrame: forcedToFrame,
    year: year,
  }, false)
  return res.results;
}

const GroupProjectSearch: FC<IProjectSearchProps> = ({
  getValues,
  control,
}) => {
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const scrollRef = useRef<HTMLDivElement>(null);
  const projectSubDivisions = useAppSelector(selectProjectSubDivisions);
  const projectDivisions = useAppSelector(selectProjectDivisions);
  const year = useAppSelector(selectStartYear);
  const { t } = useTranslation();
  const [searchWord, setSearchWord] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<Array<IOption>>([]);
  const [allProjectsUnderSelectedClass, setAllProjectsUnderSelectedClass] = useState<IProject[]>([]);

  const handleValueChange = useCallback((value: string) => setSearchWord(value), []);

  const getSuggestions = useCallback(async() => {
    return searchedProjects;
  }, [searchedProjects]);

  const getLocationParent = (locationList: IListItem[], locationId: string | undefined) => {
    return locationList.find((location) => location.id === locationId)?.parent;
  }

  useEffect( () => {
    const setProjectsForSearch = async () => {
      const groupClass = getValues('class.value');
      const groupSubClass = getValues('subClass.value');
      const projects = getProjectsUnderClassOrSubClass(groupSubClass, groupClass, forcedToFrame, year);
      setAllProjectsUnderSelectedClass(await projects)
    }
    setProjectsForSearch();
    }, [getValues('class.value'), getValues('subClass.value')]
  );

  useEffect(() => {
      const lowerCaseSearchWord = searchWord.toLowerCase();
      const groupSubDivision = getValues('subDivision.value');
      const groupDivision = getValues('division.value');
      const groupDistrict = getValues('district.value');
      const groupSubClass = getValues('subClass.value');
      const groupClass = getValues('class.value');
  
      const projectSearchResult = allProjectsUnderSelectedClass.filter((project) => {
        const projectNameMatches = project.name.toLowerCase().startsWith(lowerCaseSearchWord);
        const classMatches = (project.projectClass === groupSubClass || project.projectClass === groupClass);
        const districtMatches = 
          project.projectDistrict === groupDistrict ||
          getLocationParent(projectSubDivisions, project.projectDistrict) === groupDivision ||
          getLocationParent(projectDivisions, getLocationParent(projectSubDivisions, project.projectDistrict)) === groupDivision;
        const divisionMatches = project.projectDistrict === groupDivision || getLocationParent(projectSubDivisions, project.projectDistrict) === groupDivision;
        const subDivisionMatches = project.projectDistrict === groupSubDivision;
  
        if (groupSubDivision) return subDivisionMatches && projectNameMatches && classMatches;
        else if (groupDivision) return divisionMatches && projectNameMatches && classMatches;
        else if (groupDistrict) return districtMatches && projectNameMatches && classMatches;
        else if (groupSubClass || groupClass) {
          return classMatches && projectNameMatches;
        }
        return false;
      });
  
      const searchProjectsItemList = projectSearchResult.map((project) => ({
        ...listItemToOption({ id: project.id, value: project.name }),
      }));
      setSearchedProjects(searchProjectsItemList);
    },
    [allProjectsUnderSelectedClass, getValues, projectDivisions, projectSubDivisions, searchWord],
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
                    deleteButtonAriaLabel={`delete-project-${s.value}`}
                    onDelete={(e) => handleDelete(e, onChange)}
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
