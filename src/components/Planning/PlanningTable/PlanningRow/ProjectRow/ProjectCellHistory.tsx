import { FC, memo, useCallback, useRef, useState } from 'react';
import { IconClock } from 'hds-react/icons/';
import { useTranslation } from 'react-i18next';
import { useLazyGetProjectHistoryQuery } from '@/api/projectApi';
import { IProjectHistoryEntry } from '@/interfaces/projectInterfaces';
import { stringToDateTime } from '@/utils/dates';
import './projectCellHistory.css';

interface IProjectCellHistoryProps {
  projectId: string;
  year: number;
}

const DEFAULT_VISIBLE = 2;

/**
 * IO-881: per-cell change-history popover for the planning view. Rendered on a
 * project budget cell only while change-history mode is active. On hover it
 * lazily fetches the project's audit log narrowed to this cell's year and lists
 * who edited it and when (2 latest, with a "show more" expander).
 *
 * The popover is fixed-positioned from the cell's bounding rect so it is not
 * clipped by the planning table's horizontal scroll container.
 */
const ProjectCellHistory: FC<IProjectCellHistoryProps> = ({ projectId, year }) => {
  const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [trigger, { data, isFetching, isUninitialized }] = useLazyGetProjectHistoryQuery();

  const show = useCallback(() => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({ top: rect.bottom, left: rect.left });
    }
    setOpen(true);
    // preferCacheValue=true reuses the cached result when re-hovering the cell
    trigger({ projectId, year, pageSize: 50 }, true);
  }, [projectId, year, trigger]);

  const hide = useCallback(() => {
    setOpen(false);
    setExpanded(false);
  }, []);

  const entries = data?.results ?? [];
  const visibleEntries = expanded ? entries : entries.slice(0, DEFAULT_VISIBLE);
  const remaining = entries.length - visibleEntries.length;
  const isLoading = isFetching || isUninitialized;

  const getActorName = (entry: IProjectHistoryEntry) => {
    const name = `${entry.actor_first_name ?? ''} ${entry.actor_last_name ?? ''}`.trim();
    return name || t('tooltips.history.unknownActor');
  };

  return (
    <div
      ref={overlayRef}
      className="cell-history-overlay"
      data-testid={`cell-history-${projectId}-${year}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
    >
      <IconClock size="xs" className="cell-history-icon" aria-hidden="true" />
      {open && (
        <div
          className="cell-history-popover"
          role="tooltip"
          style={coords ? { top: coords.top, left: coords.left } : undefined}
          data-testid={`cell-history-popover-${projectId}-${year}`}
        >
          {isLoading && (
            <span className="cell-history-message">{t('tooltips.history.loading')}</span>
          )}
          {!isLoading && entries.length === 0 && (
            <span className="cell-history-message" data-testid={`cell-history-empty-${projectId}`}>
              {t('tooltips.history.empty')}
            </span>
          )}
          {!isLoading &&
            visibleEntries.map((entry) => (
              <div key={entry.id} className="cell-history-row">
                <span className="cell-history-actor">{getActorName(entry)}</span>
                <span className="cell-history-date">{stringToDateTime(entry.createdDate)}</span>
              </div>
            ))}
          {!isLoading && remaining > 0 && (
            <button
              type="button"
              className="cell-history-more"
              onClick={() => setExpanded(true)}
              data-testid={`cell-history-more-${projectId}-${year}`}
            >
              {t('tooltips.history.showMore', { count: remaining })}
            </button>
          )}
          {!isLoading && expanded && entries.length > DEFAULT_VISIBLE && (
            <button
              type="button"
              className="cell-history-more"
              onClick={() => setExpanded(false)}
              data-testid={`cell-history-less-${projectId}-${year}`}
            >
              {t('tooltips.history.showLess')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(ProjectCellHistory);
