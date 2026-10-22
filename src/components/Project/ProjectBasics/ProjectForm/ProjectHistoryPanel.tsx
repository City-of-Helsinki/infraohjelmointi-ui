import { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/common';
import { selectLists } from '@/reducers/listsSlice';
import { selectAllPlanningClasses } from '@/reducers/classSlice';
import { useGetProjectHistoryQuery } from '@/api/projectApi';
import { IProjectHistoryEntry } from '@/interfaces/projectInterfaces';
import optionIcon from '@/utils/optionIcon';
import HistoryPanel from '@/components/shared/HistoryPanel';
import {
  formFieldsOf,
  historyActionOf,
  historyFieldLabel,
  historyOptionKey,
  PILL_FIELDS,
  resolveHistoryValue,
} from './projectHistoryUtils';

interface IProjectHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

/**
 * IO-883: form-level change-history side panel. Renders the project history feed
 * through the shared HistoryPanel — phase changes as before → after pills, other
 * fields as a struck-through old → new diff. Financial (year-keyed) edits are
 * left to the planning view history.
 */
const ProjectHistoryPanel: FC<IProjectHistoryPanelProps> = ({ isOpen, onClose, projectId }) => {
  const { t } = useTranslation();
  const lists = useAppSelector(selectLists);
  const classes = useAppSelector(selectAllPlanningClasses);

  const { data, isFetching, isError } = useGetProjectHistoryQuery(
    { projectId, pageSize: 100 },
    { skip: !isOpen || !projectId },
  );

  // Only entries that touched at least one form field (not purely financial).
  const entries = useMemo(
    () => (data?.results ?? []).filter((entry) => formFieldsOf(entry).length > 0),
    [data],
  );

  const pillIcon = (entry: IProjectHistoryEntry, field: string, side: 'old' | 'new') => {
    const values = side === 'old' ? entry.old_values : entry.new_values;
    return optionIcon[historyOptionKey(field, values?.[field], lists) as keyof typeof optionIcon];
  };

  return (
    <HistoryPanel<IProjectHistoryEntry>
      isOpen={isOpen}
      onClose={onClose}
      t={t}
      testIdPrefix="project-history"
      i18nPrefix="projectForm.changeHistory"
      entries={entries}
      isFetching={isFetching}
      isError={isError}
      pillFields={PILL_FIELDS}
      fieldsOf={formFieldsOf}
      fieldLabel={(field) => historyFieldLabel(field, t)}
      resolveValue={(entry, field, side) =>
        resolveHistoryValue(
          field,
          (side === 'old' ? entry.old_values : entry.new_values)?.[field],
          lists,
          classes,
          t,
        )
      }
      pillIcon={pillIcon}
      classifyAction={historyActionOf}
      entryDate={(entry) => entry.createdDate}
    />
  );
};

export default memo(ProjectHistoryPanel);
