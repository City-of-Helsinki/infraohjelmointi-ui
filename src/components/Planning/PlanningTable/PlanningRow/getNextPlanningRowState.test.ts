import { IProject } from '@/interfaces/projectInterfaces';
import mockProject from '@/mocks/mockProject';
import { getNextPlanningRowState, IPlanningRowInputs, IPlanningRowState } from './PlanningRow';

const groupedProject: IProject = { ...mockProject.data, id: 'p-grouped', projectGroup: 'g-1' };
const ungroupedProject: IProject = { ...mockProject.data, id: 'p-ungrouped', projectGroup: null };
const projectRows = [groupedProject, ungroupedProject];

const emptyState: IPlanningRowState = {
  expanded: false,
  searchedProjectId: '',
  searchedGroupId: '',
};

const getInputs = (overrides: Partial<IPlanningRowInputs> = {}): IPlanningRowInputs => ({
  defaultExpanded: false,
  groupsExpanded: false,
  type: 'class',
  search: '',
  projectRows,
  ...overrides,
});

describe('getNextPlanningRowState', () => {
  describe('on mount', () => {
    it('uses defaultExpanded for non-group rows', () => {
      expect(
        getNextPlanningRowState(emptyState, getInputs({ defaultExpanded: true })).expanded,
      ).toBe(true);
      expect(getNextPlanningRowState(emptyState, getInputs()).expanded).toBe(false);
    });

    it('uses groupsExpanded over defaultExpanded for group rows', () => {
      const state = getNextPlanningRowState(
        emptyState,
        getInputs({ type: 'group', defaultExpanded: true, groupsExpanded: false }),
      );
      expect(state.expanded).toBe(false);
    });

    it('expands and stores the searched project when the row contains it', () => {
      const state = getNextPlanningRowState(
        emptyState,
        getInputs({ search: '?project=p-grouped' }),
      );
      expect(state).toEqual({
        expanded: true,
        searchedProjectId: 'p-grouped',
        searchedGroupId: '',
      });
    });

    it('expands a group row for a searched project even if groupsExpanded is false', () => {
      const state = getNextPlanningRowState(
        emptyState,
        getInputs({ type: 'group', groupsExpanded: false, search: '?project=p-grouped' }),
      );
      expect(state.expanded).toBe(true);
    });

    it('stores the searched group when the row contains a project of that group', () => {
      const state = getNextPlanningRowState(emptyState, getInputs({ search: '?group=g-1' }));
      expect(state).toEqual({
        expanded: true,
        searchedProjectId: '',
        searchedGroupId: 'p-grouped',
      });
    });
  });

  describe('search params', () => {
    it('does not match ungrouped projects when only a project is searched', () => {
      const state = getNextPlanningRowState(
        emptyState,
        getInputs({ search: '?project=not-in-this-row' }),
      );
      expect(state).toEqual(emptyState);
    });

    it('ignores unrelated search params', () => {
      const state = getNextPlanningRowState(emptyState, getInputs({ search: '?class=c-1' }));
      expect(state).toEqual(emptyState);
    });

    it('clears the searched ids when the search is cleared but keeps expanded', () => {
      const prev = getInputs({ search: '?project=p-grouped' });
      const current = getNextPlanningRowState(emptyState, prev);
      const next = getNextPlanningRowState(current, getInputs({ search: '' }), prev);
      expect(next).toEqual({ expanded: true, searchedProjectId: '', searchedGroupId: '' });
    });

    it('applies groupsExpanded to a group row when its search is cleared', () => {
      const prev = getInputs({ type: 'group', search: '?project=p-grouped' });
      const current = getNextPlanningRowState(emptyState, prev);
      const next = getNextPlanningRowState(current, getInputs({ type: 'group', search: '' }), prev);
      expect(next.expanded).toBe(false);
    });

    it('re-runs the search when projectRows change', () => {
      const prev = getInputs({ search: '?project=p-new', projectRows });
      const current = getNextPlanningRowState(emptyState, prev);
      expect(current.expanded).toBe(false);

      const newProject: IProject = { ...mockProject.data, id: 'p-new', projectGroup: null };
      const next = getNextPlanningRowState(
        current,
        getInputs({ search: '?project=p-new', projectRows: [...projectRows, newProject] }),
        prev,
      );
      expect(next).toEqual({ expanded: true, searchedProjectId: 'p-new', searchedGroupId: '' });
    });
  });

  describe('global groupsExpanded', () => {
    it('applies groupsExpanded changes to group rows', () => {
      const prev = getInputs({ type: 'group' });
      const next = getNextPlanningRowState(
        emptyState,
        getInputs({ type: 'group', groupsExpanded: true }),
        prev,
      );
      expect(next.expanded).toBe(true);
    });

    it('does not apply groupsExpanded to non-group rows', () => {
      const prev = getInputs();
      const next = getNextPlanningRowState(
        { ...emptyState, expanded: true },
        getInputs({ groupsExpanded: false }),
        prev,
      );
      expect(next.expanded).toBe(true);
    });

    it('does not override a group row where both a project and its group are searched', () => {
      const search = '?project=p-grouped&group=g-1';
      const prev = getInputs({ type: 'group', search });
      const current = getNextPlanningRowState(emptyState, prev);
      expect(current.expanded).toBe(true);

      const next = getNextPlanningRowState(
        current,
        getInputs({ type: 'group', search, groupsExpanded: true }),
        prev,
      );
      const collapsed = getNextPlanningRowState(
        next,
        getInputs({ type: 'group', search, groupsExpanded: false }),
        getInputs({ type: 'group', search, groupsExpanded: true }),
      );
      expect(collapsed.expanded).toBe(true);
    });
  });

  describe('unchanged inputs', () => {
    it('keeps a manually toggled expanded state', () => {
      const inputs = getInputs({ type: 'group' });
      const manuallyExpanded = { ...emptyState, expanded: true };
      expect(getNextPlanningRowState(manuallyExpanded, inputs, inputs)).toBe(manuallyExpanded);
    });

    it('resets expanded when defaultExpanded changes', () => {
      const next = getNextPlanningRowState(
        { ...emptyState, expanded: false },
        getInputs({ defaultExpanded: true }),
        getInputs({ defaultExpanded: false }),
      );
      expect(next.expanded).toBe(true);
    });
  });
});
