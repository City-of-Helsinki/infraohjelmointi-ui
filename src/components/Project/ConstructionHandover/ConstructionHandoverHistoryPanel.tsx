import { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetConstructionHandoverHistoryQuery } from '@/api/constructionHandoverApi';
import { IConstructionHandoverHistoryEntry } from '@/interfaces/constructionHandoverInterfaces';
import HistoryPanel from '@/components/shared/HistoryPanel';
import {
  changedFieldsOf,
  historyActionOf,
  historyFieldLabel,
  PILL_FIELDS,
  resolveHistoryValue,
} from './constructionHandoverHistoryUtils';

interface IConstructionHandoverHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  handoverId: string;
}

/**
 * IO-883: change-history side panel for a construction handover ("rakennuttamiseen
 * siirto"). Consumes GET /construction-handovers/{id}/history/ (IO-882), whose
 * values are already resolved server-side, and renders them through the shared
 * HistoryPanel — status changes as before → after pills, other fields as diffs.
 */
const ConstructionHandoverHistoryPanel: FC<IConstructionHandoverHistoryPanelProps> = ({
  isOpen,
  onClose,
  handoverId,
}) => {
  const { t } = useTranslation();

  const { data, isFetching, isError } = useGetConstructionHandoverHistoryQuery(
    { handoverId, pageSize: 100 },
    { skip: !isOpen || !handoverId },
  );

  const entries = useMemo(() => data?.results ?? [], [data]);

  return (
    <HistoryPanel<IConstructionHandoverHistoryEntry>
      isOpen={isOpen}
      onClose={onClose}
      t={t}
      testIdPrefix="handover-history"
      i18nPrefix="constructionHandoverForm.changeHistory"
      entries={entries}
      isFetching={isFetching}
      isError={isError}
      pillFields={PILL_FIELDS}
      fieldsOf={changedFieldsOf}
      fieldLabel={(field) => historyFieldLabel(field, t)}
      resolveValue={(entry, field, side) =>
        resolveHistoryValue(field, (side === 'old' ? entry.old_values : entry.new_values)?.[field], t)
      }
      classifyAction={historyActionOf}
      entryDate={(entry) => entry.createdDate}
    />
  );
};

export default memo(ConstructionHandoverHistoryPanel);
