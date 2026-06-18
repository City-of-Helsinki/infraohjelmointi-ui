import { FC, memo, useEffect, useMemo, useRef } from 'react';
import { IconClock, IconCross, LoadingSpinner } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/common';
import { selectLists } from '@/reducers/listsSlice';
import { selectAllPlanningClasses } from '@/reducers/classSlice';
import { useGetProjectHistoryQuery } from '@/api/projectApi';
import { IProjectHistoryEntry } from '@/interfaces/projectInterfaces';
import optionIcon from '@/utils/optionIcon';
import {
  actorNameOf,
  avatarColor,
  formFieldsOf,
  historyFieldLabel,
  historyActionOf,
  historyOptionKey,
  initialsOf,
  NO_PREVIOUS_VALUE,
  PILL_FIELDS,
  relativeHistoryDateTime,
  resolveHistoryValue,
} from './projectHistoryUtils';
import './projectHistoryPanel.css';

interface IProjectHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

/**
 * IO-883: form-level change-history side panel. Slides in from the right over the
 * project form and lists who changed what and when as a timeline — phase changes
 * render as before → after pills, other fields as a struck-through old → new
 * diff. Financial (year-keyed) edits are left to the planning view history.
 */
const ProjectHistoryPanel: FC<IProjectHistoryPanelProps> = ({ isOpen, onClose, projectId }) => {
  const { t } = useTranslation();
  const lists = useAppSelector(selectLists);
  const classes = useAppSelector(selectAllPlanningClasses);
  const closeRef = useRef<HTMLButtonElement>(null);

  const { data, isFetching, isError } = useGetProjectHistoryQuery(
    { projectId, pageSize: 100 },
    { skip: !isOpen || !projectId },
  );

  // Only entries that touched at least one form field (not purely financial).
  const entries = useMemo(
    () => (data?.results ?? []).filter((entry) => formFieldsOf(entry).length > 0),
    [data],
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const unknownActor = t('projectForm.changeHistory.unknownActor');

  const renderChange = (entry: IProjectHistoryEntry, field: string) => {
    const oldValue = resolveHistoryValue(field, entry.old_values?.[field], lists, classes, t);
    const newValue = resolveHistoryValue(field, entry.new_values?.[field], lists, classes, t);
    const fieldLabel = historyFieldLabel(field, t);

    if (PILL_FIELDS.has(field)) {
      const oldIcon =
        optionIcon[historyOptionKey(field, entry.old_values?.[field], lists) as keyof typeof optionIcon];
      const newIcon =
        optionIcon[historyOptionKey(field, entry.new_values?.[field], lists) as keyof typeof optionIcon];
      return (
        <div
          key={field}
          className="project-history-change project-history-change--pills"
          data-testid={`project-history-field-${field}`}
        >
          {oldValue && (
            <span className="project-history-pill is-old">
              {oldIcon}
              {oldValue}
            </span>
          )}
          {oldValue && <span className="project-history-arrow" aria-hidden="true">→</span>}
          <span className="project-history-pill is-new">
            {newIcon}
            {newValue || NO_PREVIOUS_VALUE}
          </span>
        </div>
      );
    }

    return (
      <div
        key={field}
        className="project-history-change"
        data-testid={`project-history-field-${field}`}
      >
        <span className="project-history-field-label">{fieldLabel}</span>
        <span className="project-history-diff">
          <span className="project-history-old-value">{oldValue || NO_PREVIOUS_VALUE}</span>
          <span className="project-history-arrow" aria-hidden="true">→</span>
          <span className="project-history-new-value">{newValue || NO_PREVIOUS_VALUE}</span>
        </span>
      </div>
    );
  };

  const renderEntry = (entry: IProjectHistoryEntry) => {
    const actorName = actorNameOf(entry, unknownActor);
    const action = historyActionOf(entry);
    const actionText =
      action.key === 'editedField'
        ? t('projectForm.changeHistory.action.editedField', {
            field: historyFieldLabel(action.field ?? '', t),
          })
        : t(`projectForm.changeHistory.action.${action.key}`);
    const fields = formFieldsOf(entry);

    return (
      <li
        key={entry.id}
        className="project-history-entry"
        data-testid={`project-history-entry-${entry.id}`}
      >
        <span
          className="project-history-avatar"
          style={{ backgroundColor: avatarColor(entry.actor ?? actorName) }}
          aria-hidden="true"
        >
          {initialsOf(entry.actor_first_name, entry.actor_last_name)}
        </span>
        <div className="project-history-entry-body">
          <div className="project-history-entry-header">
            <span className="project-history-actor">{actorName}</span>
            <span className="project-history-action">{actionText}</span>
            <span className="project-history-date">
              {relativeHistoryDateTime(entry.createdDate, t)}
            </span>
          </div>
          {fields.length > 0 && (
            <div className="project-history-changes">
              {fields.map((field) => renderChange(entry, field))}
            </div>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="project-history-overlay" data-testid="project-history-overlay">
      <button
        type="button"
        className="project-history-scrim"
        aria-label={t('projectForm.changeHistory.close')}
        onClick={onClose}
        tabIndex={-1}
      />
      <aside
        className="project-history-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t('projectForm.changeHistory.title')}
      >
        <header className="project-history-panel-header">
          <span className="project-history-panel-title">
            <IconClock aria-hidden="true" />
            {t('projectForm.changeHistory.title')}
          </span>
          <button
            ref={closeRef}
            type="button"
            className="project-history-close"
            onClick={onClose}
            aria-label={t('projectForm.changeHistory.close')}
            data-testid="close-project-history-button"
          >
            <IconCross aria-hidden="true" />
          </button>
        </header>

        <div className="project-history-content" data-testid="project-history-content">
          {isFetching && (
            <div className="project-history-status">
              <LoadingSpinner small />
              <span>{t('projectForm.changeHistory.loading')}</span>
            </div>
          )}
          {!isFetching && isError && (
            <p className="project-history-status" data-testid="project-history-error">
              {t('projectForm.changeHistory.error')}
            </p>
          )}
          {!isFetching && !isError && entries.length === 0 && (
            <p className="project-history-status" data-testid="project-history-empty">
              {t('projectForm.changeHistory.empty')}
            </p>
          )}
          {!isFetching && !isError && entries.length > 0 && (
            <ol className="project-history-timeline">{entries.map(renderEntry)}</ol>
          )}
        </div>
      </aside>
    </div>
  );
};

export default memo(ProjectHistoryPanel);
