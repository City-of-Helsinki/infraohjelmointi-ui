import { IOption } from '@/interfaces/common';
import { getProjectsWithParams } from '@/services/projectServices';
import { arrayHasValue, listItemToOption } from '@/utils/common';
import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import { FC, memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, Controller, UseFormGetValues } from 'react-hook-form';
import { IGroupForm } from '@/interfaces/formInterfaces';
import { IProjectSearchRequest } from '@/interfaces/searchInterfaces';
import { useAppSelector } from '@/hooks/common';
import { selectForcedToFrame } from '@/reducers/planningSlice';
import { ILocation } from '@/interfaces/locationInterfaces';
import { selectPlanningDistricts, selectPlanningDivisions } from '@/reducers/locationSlice';

interface IProjectSearchProps {
  getValues: UseFormGetValues<IGroupForm>;
  control: Control<IGroupForm>;
  showAdvanceFields: boolean;
  divisions: IOption[];
  subClasses: IOption[];
}

const getLocationRelationId = (form: IGroupForm, hierarchyDistricts: ILocation[], hierarchyDivisions: ILocation[]) => {
  const relatedDistricts = hierarchyDistricts.filter(({ parentClass }) => parentClass === form.subClass.value ? true : parentClass === form.class.value);
  if (form.district.label) {
    const relatedDistrict = relatedDistricts.find(({ name }) => name.includes(form.district.label));
    if (form.division.label && relatedDistrict) {
      const relatedDivisions = hierarchyDivisions.filter(({ parent }) => parent === relatedDistrict.id);
      const relatedDivision = relatedDivisions.find(({ name }) => name.includes(form.division.label));
      if (relatedDivision) {
        return relatedDivision.id;
      }
      return relatedDistrict.id;
    } else if (relatedDistrict) {
      return relatedDistrict.id
    }
  }
  return '';
}

const GroupProjectSearch: FC<IProjectSearchProps> = ({
  getValues,
  control,
  showAdvanceFields,
  divisions,
  subClasses
}) => {
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hierarchyDistricts = useAppSelector(selectPlanningDistricts);
  const hierarchyDivisions = useAppSelector(selectPlanningDivisions);

  const buildQueryParamString = useCallback(
    (projectName: string): IProjectSearchRequest => {
      const searchParams = [];

      const year = new Date().getFullYear();
      const lowestLocationId = getLocationRelationId(getValues(), hierarchyDistricts, hierarchyDivisions);

      if (subClasses.length > 0){
        searchParams.push(`subClass=${getValues('subClass').value}`);
      }
      else {
        searchParams.push(`class=${getValues('class').value}`);
      }

      if (getValues("division").value) {
        searchParams.push(`division=${lowestLocationId}`);
      } else if (getValues('district').value) {
        searchParams.push(`district=${lowestLocationId}`);
      }
      searchParams.push(`projectName=${projectName}`);
      searchParams.push('inGroup=false');
      searchParams.push('programmed=true');

      return { params: searchParams.join('&'), direct: !showAdvanceFields, forcedToFrame, year };
    },
    [getValues, showAdvanceFields, forcedToFrame, subClasses],
  );

  const { t } = useTranslation();
  const [searchWord, setSearchWord] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<Array<IOption>>([]);

  const handleValueChange = useCallback((value: string) => setSearchWord(value), []);

  const getSuggestions = useCallback(
    async (inputValue: string) => {
      if (
          (subClasses.length > 0 && !getValues('subClass').value) ||
          !getValues('class').value
      ) {
        return Promise.resolve([]);
      }

      try {
        const queryParams = buildQueryParamString(inputValue);
        const res = await getProjectsWithParams(queryParams);

        const projectsIdList = getValues('projectsForSubmit').map((p) => p.value);

        const resultList = res.results?.filter(
          (project) => !arrayHasValue(projectsIdList, project.id),
        );

        const searchProjectsItemList: Array<IOption> | [] = resultList
          ? resultList.map((project) => ({
              ...listItemToOption({ id: project.id, value: project.name }),
            }))
          : [];

        if (searchProjectsItemList.length > 0) {
          setSearchedProjects(searchProjectsItemList);
        }

        return searchProjectsItemList;
      } catch (e) {
        console.log('Error getting project suggestions: ', e);
        return [];
      }
    },
    [getValues, showAdvanceFields, buildQueryParamString, divisions],
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
