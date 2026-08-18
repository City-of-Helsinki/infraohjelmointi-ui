import { ReactNode, useEffect, useRef } from 'react';
import { IconClock, IconCross, LoadingSpinner } from 'hds-react';
import { TFunction } from 'i18next';
import {
  actorNameOf,
  avatarColor,
  IHistoryActor,
  initialsOf,
  NO_PREVIOUS_VALUE,
  relativeHistoryDateTime,
} from '@/utils/historyPanelUtils';
import './historyPanel.css';

// The minimum shape a history entry must have for the shared panel to render its
// timeline row. Feature-specific fields (old_values, operation, …) are read by
// the caller's callbacks, so they stay off this base type.
export interface IHistoryPanelEntry extends IHistoryActor {
  id: string;
  actor: string | null;
}

export interface IHistoryPanelProps<E extends IHistoryPanelEntry> {
  isOpen: boolean;
  onClose: () => void;
  t: TFunction;
  // Distinguishes the two panels' data-testids (e.g. 'project-history').
  testIdPrefix: 'project-history' | 'handover-history';
  // i18n namespace for the panel chrome and action phrasing
  // (e.g. 'projectForm.changeHistory').
  i18nPrefix: string;
  entries: Array<E>;
  isFetching: boolean;
  isError: boolean;
  // Fields rendered as before → after "pills" instead of a struck-through diff.
  pillFields: Set<string>;
  fieldsOf: (entry: E) => Array<string>;
  fieldLabel: (field: string) => string;
  // Resolve the old/new side of a field to a display string.
  resolveValue: (entry: E, field: string, side: 'old' | 'new') => string;
  // Optional leading icon for a pill value (e.g. the project phase icon).
  pillIcon?: (entry: E, field: string, side: 'old' | 'new') => ReactNode;
  // Classify what an entry did, so the panel can phrase it via the i18n
  // namespace ({i18nPrefix}.action.{key}, with an `editedField` special case).
  classifyAction: (entry: E) => { key: string; field?: string };
  entryDate: (entry: E) => string | null;
}

/**
 * IO-883: shared change-history side panel. Slides in from the right and lists
 * who changed what and when as an actor timeline — configured "pill" fields
 * render as before → after pills, other fields as a struck-through old → new
 * diff. The project form and the construction handover both drive it with their
 * own value resolution while sharing the layout, styling and keyboard handling.
 */
const HistoryPanel = <E extends IHistoryPanelEntry>({
  isOpen,
  onClose,
  t,
  testIdPrefix,
  i18nPrefix,
  entries,
  isFetching,
  isError,
  pillFields,
  fieldsOf,
  fieldLabel,
  resolveValue,
  pillIcon,
  classifyAction,
  entryDate,
}: IHistoryPanelProps<E>) => {
  const closeRef = useRef<HTMLButtonElement>(null);

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

  const label = (key: string) => t(`${i18nPrefix}.${key}`);

  const actionText = (entry: E) => {
    const action = classifyAction(entry);
    return action.key === 'editedField'
      ? t(`${i18nPrefix}.action.editedField`, { field: fieldLabel(action.field ?? '') })
      : t(`${i18nPrefix}.action.${action.key}`);
  };

  const renderChange = (entry: E, field: string) => {
    const oldValue = resolveValue(entry, field, 'old');
    const newValue = resolveValue(entry, field, 'new');

    if (pillFields.has(field)) {
      return (
        <div
          key={field}
          className="project-history-change project-history-change--pills"
          data-testid={`${testIdPrefix}-field-${field}`}
        >
          {oldValue && (
            <span className="project-history-pill is-old">
              {pillIcon?.(entry, field, 'old')}
              {oldValue}
            </span>
          )}
          {oldValue && (
            <span className="project-history-arrow" aria-hidden="true">
              →
            </span>
          )}
          <span className="project-history-pill is-new">
            {pillIcon?.(entry, field, 'new')}
            {newValue || NO_PREVIOUS_VALUE}
          </span>
        </div>
      );
    }

    return (
      <div
        key={field}
        className="project-history-change"
        data-testid={`${testIdPrefix}-field-${field}`}
      >
        <span className="project-history-field-label">{fieldLabel(field)}</span>
        <span className="project-history-diff">
          <span className="project-history-old-value">{oldValue || NO_PREVIOUS_VALUE}</span>
          <span className="project-history-arrow" aria-hidden="true">
            →
          </span>
          <span className="project-history-new-value">{newValue || NO_PREVIOUS_VALUE}</span>
        </span>
      </div>
    );
  };

  const renderEntry = (entry: E) => {
    const actorName = actorNameOf(entry, label('unknownActor'));
    const fields = fieldsOf(entry);

    return (
      <li
        key={entry.id}
        className="project-history-entry"
        data-testid={`${testIdPrefix}-entry-${entry.id}`}
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
            <span className="project-history-action">{actionText(entry)}</span>
            <span className="project-history-date">
              {relativeHistoryDateTime(entryDate(entry), t, i18nPrefix)}
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
    <div className="project-history-overlay" data-testid={`${testIdPrefix}-overlay`}>
      <button
        type="button"
        className="project-history-scrim"
        aria-label={label('close')}
        onClick={onClose}
        tabIndex={-1}
      />
      <dialog open className="project-history-panel" aria-modal="true" aria-label={label('title')}>
        <header className="project-history-panel-header">
          <span className="project-history-panel-title">
            <IconClock aria-hidden="true" />
            {label('title')}
          </span>
          <button
            ref={closeRef}
            type="button"
            className="project-history-close"
            onClick={onClose}
            aria-label={label('close')}
            data-testid={`close-${testIdPrefix}-button`}
          >
            <IconCross aria-hidden="true" />
          </button>
        </header>

        <div className="project-history-content" data-testid={`${testIdPrefix}-content`}>
          {isFetching && (
            <div className="project-history-status">
              <LoadingSpinner small />
              <span>{label('loading')}</span>
            </div>
          )}
          {!isFetching && isError && (
            <p className="project-history-status" data-testid={`${testIdPrefix}-error`}>
              {label('error')}
            </p>
          )}
          {!isFetching && !isError && entries.length === 0 && (
            <p className="project-history-status" data-testid={`${testIdPrefix}-empty`}>
              {label('empty')}
            </p>
          )}
          {!isFetching && !isError && entries.length > 0 && (
            <ol className="project-history-timeline">{entries.map(renderEntry)}</ol>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default HistoryPanel;
