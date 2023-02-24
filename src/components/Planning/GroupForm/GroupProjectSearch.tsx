import { Paragraph } from '@/components/shared';
import { FreeSearchFormItem, IFreeSearchResult, IListItem, IOption } from '@/interfaces/common';
import { getProjectsWithFreeSearch, getProjectsWithParams } from '@/services/projectServices';
import { arrayHasValue, listItemToOption } from '@/utils/common';
import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import _ from 'lodash';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormGetValues } from 'react-hook-form';
import { IGroupForm } from '@/interfaces/formInterfaces';
// Build a search parameter with all the choices from the search form

const buildQueryParamString = (state: IQueryParamsState, projectName: string): string => {
  const searchParams = [];
  for (const [key, value] of Object.entries(state)) {
    switch (key) {
      case 'masterClass':
      case 'class':
      case 'subClass':
      case 'district':
      case 'division':
      case 'subDivision':
        value && searchParams.push(`${key}=${value}`);
        break;
    }
  }
  searchParams.push(`projectName=${projectName}`);
  searchParams.push('inGroup=false');
  searchParams.push('programmed=true');

  return searchParams.join('&');
};

interface IProjectSearchProps {
  onProjectClick: (value: IOption | undefined) => void;
  projectsForSubmit: Array<IOption>;
  onProjectSelectionDelete: (projectName: string) => void;
  getValues: UseFormGetValues<IGroupForm>;
}

interface IQueryParamsState {
  masterClass: string;
  class: string;
  subClass: string;
  district: string;
  division: string;
  subDivision: string;
}

const GroupProjectSearch: FC<IProjectSearchProps> = ({
  onProjectClick,
  projectsForSubmit,
  onProjectSelectionDelete,
  getValues,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<Array<IOption>>([]);
  const [queryParams, setQueryParams] = useState<IQueryParamsState>({
    masterClass: '',
    class: '',
    subClass: '',
    district: '',
    division: '',
    subDivision: '',
  });

  useEffect(() => {
    console.log('firing');
    setQueryParams((current) => ({
      ...current,
      masterClass: getValues().masterClass?.value ? getValues().masterClass?.value : '',
      class: getValues().class?.value ? getValues().class?.value : '',
      subClass: getValues().subClass?.value ? getValues().subClass?.value : '',
      district: getValues().district?.value ? getValues().district?.value : '',
      division: getValues().division?.value ? getValues().division?.value : '',
      subDivision: getValues().subDivision?.value ? getValues().subDivision?.value : '',
    }));
  }, [getValues]);
  const handleValueChange = useCallback((value: string) => setValue(value), []);

  const getSuggestions = useCallback(
    (inputValue: string) =>
      new Promise<{ value: string; label: string }[]>((resolve, reject) => {
        // printing out search params for later
        const queryString = buildQueryParamString(queryParams, inputValue);
        console.log(queryString);

        getProjectsWithParams(queryString)
          .then((res) => {
            if (res) {
              // Filter out only the projects which haven't yet been added to be the submitted list from the result
              const resultList = res.projects?.filter(
                ({ project }) =>
                  !arrayHasValue(
                    projectsForSubmit.map((p) => p.value),
                    project.id,
                  ),
              );
              console.log(resultList);

              // Convert the resultList to options for the suggestion dropdown
              const searchProjectsItemList: Array<IOption> | [] = resultList
                ? resultList.map(({ project }) => ({
                    ...listItemToOption({ id: project.id, value: project.name }),
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
      }),
    [projectsForSubmit, getValues],
  );

  const handleSubmit = (value: string) => {
    value && onProjectClick(searchedProjects.find((p) => p.label === value));
    setValue('');
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    onProjectSelectionDelete(
      (e.currentTarget as HTMLButtonElement)?.parentElement?.innerText as string,
    );
  };
  return (
    <div className="dialog-section" data-testid="search-project-field-section">
      <SearchInput
        label={t('searchForProjects')}
        getSuggestions={getSuggestions}
        clearButtonAriaLabel="Clear search field"
        searchButtonAriaLabel="Search"
        suggestionLabelField="label"
        value={value}
        onChange={handleValueChange}
        onSubmit={handleSubmit}
      />
      <div className="search-selections">
        {projectsForSubmit.map((s) => (
          <Tag key={s.label} onDelete={handleDelete}>
            {s.label}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default memo(GroupProjectSearch);
