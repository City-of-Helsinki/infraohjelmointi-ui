import { Paragraph } from '@/components/shared';
import { FreeSearchFormItem, IFreeSearchResult, IListItem, IOption } from '@/interfaces/common';
import { getProjectsWithFreeSearch } from '@/services/projectServices';
import { arrayHasValue, listItemToOption } from '@/utils/common';
import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import _ from 'lodash';
import { FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IProjectSearchProps {
  onProjectClick: (value: IOption | undefined) => void;
  projectsForSubmit: Array<IOption>;
}

const GroupProjectSearch: FC<IProjectSearchProps> = ({ onProjectClick, projectsForSubmit }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<Array<IOption>>([]);

  const handleValueChange = useCallback((value: string) => setValue(value), []);

  const getSuggestions = useCallback(
    (inputValue: string) =>
      new Promise<{ value: string; label: string }[]>((resolve, reject) => {
        getProjectsWithFreeSearch(inputValue)
          .then((res) => {
            if (res) {
              // Filter out only the projects which haven't yet been added to be the submitted list from the result
              const resultList = res.projects?.filter(
                (f) =>
                  !arrayHasValue(
                    projectsForSubmit.map((p) => p.value),
                    f.id,
                  ),
              );

              // Convert the resultList to options for the suggestion dropdown
              const searchProjectsItemList: Array<IOption> | [] = resultList
                ? resultList.map((r) => ({ ...listItemToOption(r) }))
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
    [projectsForSubmit],
  );

  const handleSubmit = (value: string) => {
    value && onProjectClick(searchedProjects.find((p) => p.label === value));
    setValue('');
  };
  /**
   * Get the name and delete from local state
   */
  const onSelectionDelete = useCallback((e: any) => {
    console.log(e.target);
  }, []);
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
          <Tag key={s.label} onDelete={onSelectionDelete}>
            {s.label}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default memo(GroupProjectSearch);
