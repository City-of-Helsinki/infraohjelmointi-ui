import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
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
const POPOVER_MAX_HEIGHT = 280;
const VIEWPORT_GAP = 8;

/**
 * IO-881: per-cell change-history popover for the planning view. Rendered on a
 * project budget cell only while change-history mode is active. On hover it
 * lazily fetches the project's audit log narrowed to this cell's year and lists
 * who edited it and when (2 latest, with a "show more" expander).
 *
 * The popover is fixed-positioned above the cell (design default) with a
 * scrollable body so long lists stay readable without moving with the table.
 */
const ProjectCellHistory: FC<IProjectCellHistoryProps> = ({ projectId, year }) => {
  const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number>();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [placement, setPlacement] = useState<'above' | 'below'>('above');
  const [coords, setCoords] = useState<{ top: number; left: number; maxHeight: number } | null>(
    null,
  );
  const [trigger, { data, isFetching, isUninitialized }] = useLazyGetProjectHistoryQuery();

  const positionPopover = useCallback(() => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const spaceAbove = rect.top - VIEWPORT_GAP;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_GAP;
    const placeAbove = spaceAbove >= 80 || spaceAbove >= spaceBelow;
    const maxHeight = Math.min(
      POPOVER_MAX_HEIGHT,
      Math.max(80, placeAbove ? spaceAbove : spaceBelow),
    );
    const top = placeAbove
      ? Math.max(VIEWPORT_GAP, rect.top - maxHeight - VIEWPORT_GAP)
      : rect.bottom + VIEWPORT_GAP;
    setPlacement(placeAbove ? 'above' : 'below');
    setCoords({ top, left: rect.left, maxHeight });
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = undefined;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      setExpanded(false);
    }, 120);
  }, [cancelHide]);

  const show = useCallback(() => {
    cancelHide();
    positionPopover();
    setOpen(true);
    trigger({ projectId, year, pageSize: 50 }, true);
  }, [cancelHide, positionPopover, projectId, year, trigger]);

  useEffect(() => () => cancelHide(), [cancelHide]);

  const entries = data?.results ?? [];
  const visibleEntries = expanded ? entries : entries.slice(0, DEFAULT_VISIBLE);
  const remaining = entries.length - visibleEntries.length;
  const isLoading = isFetching || isUninitialized;

  const getActorName = (entry: IProjectHistoryEntry) => {
    const name = `${entry.actor_first_name ?? ''} ${entry.actor_last_name ?? ''}`.trim();
    return name || t('tooltips.history.unknownActor');
  };

  const handleExpand = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    cancelHide();
    setExpanded(true);
  };

  const handleCollapse = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    cancelHide();
    setExpanded(false);
  };

  return (
    <div
      ref={overlayRef}
      className="cell-history-overlay"
      data-testid={`cell-history-${projectId}-${year}`}
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
      onFocus={show}
      onBlur={scheduleHide}
      tabIndex={0}
    >
      {open && (
        <div
          ref={popoverRef}
          className={`cell-history-popover cell-history-popover--${placement}`}
          role="tooltip"
          style={
            coords
              ? {
                  top: coords.top,
                  left: coords.left,
                  maxHeight: coords.maxHeight,
                }
              : undefined
          }
          data-testid={`cell-history-popover-${projectId}-${year}`}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        >
          {isLoading && (
            <span className="cell-history-message">{t('tooltips.history.loading')}</span>
          )}
          {!isLoading && entries.length === 0 && (
            <span className="cell-history-message" data-testid={`cell-history-empty-${projectId}`}>
              {t('tooltips.history.empty')}
            </span>
          )}
          {!isLoading && (
            <div className="cell-history-rows">
              {visibleEntries.map((entry) => (
                <div key={entry.id} className="cell-history-row">
                  <span className="cell-history-actor">{getActorName(entry)}</span>
                  <span className="cell-history-date">{stringToDateTime(entry.createdDate)}</span>
                </div>
              ))}
            </div>
          )}
          {!isLoading && remaining > 0 && (
            <button
              type="button"
              className="cell-history-more"
              onMouseDown={handleExpand}
              data-testid={`cell-history-more-${projectId}-${year}`}
            >
              {t('tooltips.history.showMore', { count: remaining })}
            </button>
          )}
          {!isLoading && expanded && entries.length > DEFAULT_VISIBLE && (
            <button
              type="button"
              className="cell-history-more"
              onMouseDown={handleCollapse}
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
