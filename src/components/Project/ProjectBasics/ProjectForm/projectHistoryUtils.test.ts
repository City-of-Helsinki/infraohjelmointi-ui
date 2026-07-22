import { TFunction } from 'i18next';
import { IClass } from '@/interfaces/classInterfaces';
import { IListState } from '@/reducers/listsSlice';
import { historyOptionKey, resolveHistoryValue } from './projectHistoryUtils';

// Echo the i18n key so we can assert the option catalogue is consulted.
const t = ((key: string) => key) as unknown as TFunction;

const lists = {
  phases: [{ id: 'phase-uuid', value: 'programming' }],
  categories: [],
} as unknown as IListState;

const classes = [
  { id: 'class-uuid', name: 'Uudisrakentaminen' },
  { id: 'sub-uuid', name: 'Katujen rakentaminen' },
] as unknown as Array<IClass>;

describe('resolveHistoryValue', () => {
  it('translates a phase stored as a UUID via the option catalogue', () => {
    // form edit → audited as the phase row UUID
    expect(resolveHistoryValue('phase', 'phase-uuid', lists, classes, t)).toBe('option.programming');
  });

  it('translates a phase stored as an enum value via the option catalogue', () => {
    // planning phase menu → audited as the enum value directly
    expect(resolveHistoryValue('phase', 'proposal', lists, classes, t)).toBe('option.proposal');
  });

  it('resolves a projectClass/subclass UUID to its class name', () => {
    expect(resolveHistoryValue('projectClass', 'sub-uuid', lists, classes, t)).toBe(
      'Katujen rakentaminen',
    );
  });

  it('falls back to the raw value when a class UUID is unknown', () => {
    expect(resolveHistoryValue('projectClass', 'unknown-uuid', lists, classes, t)).toBe(
      'unknown-uuid',
    );
  });

  it('treats the backend "None" sentinel as an empty value', () => {
    expect(resolveHistoryValue('phase', 'None', lists, classes, t)).toBe('');
  });

  it('returns a plain (non-relation) field value unchanged', () => {
    expect(resolveHistoryValue('name', 'Hanke A', lists, classes, t)).toBe('Hanke A');
  });
});

describe('historyOptionKey', () => {
  it('returns the enum value behind a relation UUID', () => {
    expect(historyOptionKey('phase', 'phase-uuid', lists)).toBe('programming');
  });

  it('passes an enum value (non-UUID) through unchanged', () => {
    expect(historyOptionKey('phase', 'proposal', lists)).toBe('proposal');
  });
});
