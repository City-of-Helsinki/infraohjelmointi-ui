import { TFunction } from 'i18next';
import { IConstructionHandoverHistoryEntry } from '@/interfaces/constructionHandoverInterfaces';
import {
  changedFieldsOf,
  historyActionOf,
  historyFieldLabel,
  resolveHistoryValue,
} from './constructionHandoverHistoryUtils';

// Echo the i18n key so we can assert the catalogue is consulted.
const t = ((key: string) => key) as unknown as TFunction;

const entry = (
  over: Partial<IConstructionHandoverHistoryEntry>,
): IConstructionHandoverHistoryEntry => ({
  id: 'e',
  actor: 'a',
  actor_username: 'u',
  actor_first_name: 'Anna',
  actor_last_name: 'Hakala',
  operation: 'UPDATE',
  old_values: {},
  new_values: {},
  changed_fields: [],
  createdDate: '2026-03-12T14:08:00Z',
  ...over,
});

describe('resolveHistoryValue', () => {
  it('maps a status enum to its localised label key', () => {
    expect(resolveHistoryValue('status', 'SUBMITTED_TO_PROGRAMMER', t)).toBe(
      'constructionHandoverForm.status.submittedToProgrammer',
    );
  });

  it('formats an ISO date field into HDS format', () => {
    expect(resolveHistoryValue('constructionStart', '2026-07-22', t)).toBe('22.07.2026');
  });

  it('formats totalCost as euro currency', () => {
    expect(resolveHistoryValue('totalCost', '150000', t)).toMatch(/150\s?000,00€/);
  });

  it('runs relation values through the option catalogue', () => {
    expect(resolveHistoryValue('constructionProcurementMethod', 'openTender', t)).toBe(
      'option.openTender',
    );
    expect(resolveHistoryValue('previousProjectPhase', 'programming', t)).toBe('option.programming');
  });

  it('passes a plain text value through unchanged', () => {
    expect(resolveHistoryValue('name', 'Urakka A', t)).toBe('Urakka A');
  });

  it('treats the backend "None" / null sentinels as empty', () => {
    expect(resolveHistoryValue('description', 'None', t)).toBe('');
    expect(resolveHistoryValue('personPlanning', null, t)).toBe('');
  });
});

describe('changedFieldsOf', () => {
  it('returns the backend-ordered changed fields', () => {
    expect(changedFieldsOf(entry({ changed_fields: ['status', 'name'] }))).toEqual([
      'status',
      'name',
    ]);
  });
});

describe('historyActionOf', () => {
  it('labels a CREATE event', () => {
    expect(historyActionOf(entry({ operation: 'CREATE' })).key).toBe('created');
  });

  it('labels a status-only change', () => {
    expect(historyActionOf(entry({ changed_fields: ['status'] })).key).toBe('changedStatus');
  });

  it('labels a single non-status field edit', () => {
    expect(historyActionOf(entry({ changed_fields: ['name'] }))).toEqual({
      key: 'editedField',
      field: 'name',
    });
  });

  it('labels a multi-field edit', () => {
    expect(historyActionOf(entry({ changed_fields: ['name', 'description'] })).key).toBe(
      'editedForm',
    );
  });
});

describe('historyFieldLabel', () => {
  it('builds a field-label i18n key', () => {
    expect(historyFieldLabel('status', t)).toBe(
      'constructionHandoverForm.changeHistory.fields.status',
    );
  });
});
