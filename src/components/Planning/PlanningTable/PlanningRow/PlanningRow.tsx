// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, useCallback, useEffect, useState } from 'react';
import PlanningCell from './PlanningCell';
import PlanningHead from './PlanningHead';
import { IPlanningCell, IPlanningRow } from '@/interfaces/planningInterfaces';
import ProjectRow from './ProjectRow/ProjectRow';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/common';
import { selectGroupsExpanded } from '@/reducers/planningSlice';
import './styles.css';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';

export interface IPlanningRowState {
  expanded: boolean;
  searchedProjectId: string;
  searchedGroupId: string;
}

export interface IPlanningRowInputs {
  defaultExpanded: boolean;
  groupsExpanded: boolean;
  type: IPlanningRow['type'];
  search: string;
  projectRows: IPlanningRow['projectRows'];
}

const hasInputsChanged = (prev: IPlanningRowInputs, next: IPlanningRowInputs) =>
  (Object.keys(next) as Array<keyof IPlanningRowInputs>).some((key) => prev[key] !== next[key]);

// Finds the project/group from the 'project' and 'group' searchParams if the current row contains them
const getSearchResult = (search: string, projectRows: IPlanningRow['projectRows']) => {
  const params = new URLSearchParams(search);
  const projectId = params.get('project');
  const groupId = params.get('group');

  if (!search || (!projectId && !groupId)) {
    return { searchedProjectId: '', searchedGroupId: '', found: false };
  }

  const project = projectId ? projectRows.find((p) => p.id === projectId) : undefined;
  const group = groupId ? projectRows.find((g) => g.projectGroup === groupId) : undefined;

  return {
    searchedProjectId: project?.id ?? '',
    searchedGroupId: group?.id ?? '',
    found: !!(project || group),
  };
};

export const getNextPlanningRowState = (
  current: IPlanningRowState,
  inputs: IPlanningRowInputs,
  prev?: IPlanningRowInputs,
): IPlanningRowState => {
  let next = current;

  if (!prev || prev.defaultExpanded !== inputs.defaultExpanded) {
    next = { ...next, expanded: inputs.defaultExpanded || false };
  }

  let found = false;
  if (!prev || prev.search !== inputs.search || prev.projectRows !== inputs.projectRows) {
    const result = getSearchResult(inputs.search, inputs.projectRows);
    next = {
      ...next,
      searchedProjectId: result.searchedProjectId,
      searchedGroupId: result.searchedGroupId,
    };
    found = result.found;
  }

  const searchedIdsChanged =
    next.searchedProjectId !== current.searchedProjectId ||
    next.searchedGroupId !== current.searchedGroupId;

  // Only apply global groupsExpanded if not in search mode
  if (
    (!prev ||
      prev.type !== inputs.type ||
      prev.groupsExpanded !== inputs.groupsExpanded ||
      searchedIdsChanged) &&
    inputs.type === 'group' &&
    (!next.searchedProjectId || !next.searchedGroupId)
  ) {
    next = { ...next, expanded: inputs.groupsExpanded };
  }

  if (found) {
    next = { ...next, expanded: true };
  }

  return next;
};

type PlanningRowProps = IPlanningRow & {
  sapCosts: Record<string, IProjectSapCost>;
};

// Must not subscribe to the store itself: setState during render drops useSelector updates in React 18.2 (facebook/react#25565)
const PlanningRowContent: FC<PlanningRowProps & { groupsExpanded: boolean }> = ({
  groupsExpanded,
  ...props
}) => {
  const { defaultExpanded, projectRows, cells, id, type, sapCosts } = props;
  const { search } = useLocation();

  const inputs: IPlanningRowInputs = { defaultExpanded, groupsExpanded, type, search, projectRows };
  const [prevInputs, setPrevInputs] = useState(inputs);
  const [planningRowState, setPlanningRowState] = useState<IPlanningRowState>(() =>
    getNextPlanningRowState(
      { expanded: false, searchedProjectId: '', searchedGroupId: '' },
      inputs,
    ),
  );

  if (hasInputsChanged(prevInputs, inputs)) {
    setPrevInputs(inputs);
    setPlanningRowState((current) => getNextPlanningRowState(current, inputs, prevInputs));
  }

  const { expanded, searchedProjectId } = planningRowState;

  /**
   * Adds the currently clicked items id to the search params, expand the row and navigate to the new URL
   */
  const handleExpand = useCallback(() => {
    setPlanningRowState((current) => ({ ...current, expanded: !current.expanded }));
  }, []);

  // Listens to searchedProjectId and scrolls the viewport to the project
  useEffect(() => {
    if (!searchedProjectId) {
      return;
    }

    const element = document.getElementById(`project-row-${searchedProjectId}`);

    if (element) {
      element.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }
  }, [searchedProjectId]);

  /* Rows that type is districtPreview should only exist on a subClass level. If user chose a district as a subClass and then chose 
     the same district as project's location a bit lower on the project form, the district were rendered twice in the planning view */
  if (
    !search.includes('subClass') &&
    props.name.includes('suurpiiri') &&
    props.type === 'districtPreview'
  ) {
    return <></>;
  }

  return (
    <>
      <tr className={props.type} data-testid={`row-${props.id}`}>
        <PlanningHead
          handleExpand={handleExpand}
          expanded={expanded}
          {...props}
          projectRows={projectRows}
        />
        {cells.map((c: IPlanningCell) => (
          <PlanningCell {...props} cell={c} key={c.key} />
        ))}
      </tr>
      {expanded && (
        <>
          {projectRows.map((p) => (
            <ProjectRow
              key={p.id}
              project={p}
              isSearched={p.id === searchedProjectId}
              parentId={id}
              sapCosts={sapCosts}
            />
          ))}
          {/* Render the rows recursively for each childRows */}
          {props.children.map((c) => (
            <PlanningRow {...c} sapCosts={sapCosts} />
          ))}
        </>
      )}
    </>
  );
};

const PlanningRow: FC<PlanningRowProps> = (props) => {
  const groupsExpanded = useAppSelector(selectGroupsExpanded);
  return <PlanningRowContent {...props} groupsExpanded={groupsExpanded} />;
};

export default memo(PlanningRow);
