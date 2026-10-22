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

interface IPlanningRowState {
  expanded: boolean;
  searchedProjectId: string;
  searchedGroupId: string;
}

// Resets via the given callback if value is falsy and has actually changed from current
const resetIfCleared = (value: string | null, current: string, reset: () => void) => {
  if (!value && value !== current) {
    reset();
  }
};

const PlanningRow: FC<
  IPlanningRow & {
    sapCosts: Record<string, IProjectSapCost>;
  }
> = (props) => {
  const { defaultExpanded, projectRows, cells, id, type, sapCosts } = props;
  const groupsExpanded = useAppSelector(selectGroupsExpanded);
  const { search } = useLocation();

  const [planningRowState, setPlanningRowState] = useState<IPlanningRowState>({
    expanded: defaultExpanded,
    searchedProjectId: '',
    searchedGroupId: '',
  });

  const { expanded, searchedProjectId, searchedGroupId } = planningRowState;

  /**
   * Adds the currently clicked items id to the search params, expand the row and navigate to the new URL
   */
  const handleExpand = useCallback(() => {
    setPlanningRowState((current) => ({ ...current, expanded: !current.expanded }));
  }, []);

  // Set the rows initial expanded state
  useEffect(() => {
    setPlanningRowState((current) => ({ ...current, expanded: defaultExpanded || false }));
  }, [defaultExpanded]);

  useEffect(() => {
    if (type === 'group' && !searchedProjectId) {
      // Only apply global groupsExpanded if not in search mode
      setPlanningRowState((current) => ({ ...current, expanded: groupsExpanded }));
    }

    if (type === 'group' && !searchedGroupId) {
      // Only apply global groupsExpanded if not in search mode
      setPlanningRowState((current) => ({ ...current, expanded: groupsExpanded }));
    }
  }, [type, groupsExpanded, searchedProjectId, searchedGroupId]);

  const resetSearchedProjectId = useCallback(() => {
    setPlanningRowState((current) => ({ ...current, searchedProjectId: '' }));
  }, []);

  const resetSearchedGroupId = useCallback(() => {
    setPlanningRowState((current) => ({ ...current, searchedGroupId: '' }));
  }, []);

  // Listens to the 'project' searchParam and sets the searchedProjectId and expanded to true if
  // the current row contains the project
  useEffect(() => {
    if (!search) {
      resetSearchedProjectId();
      resetSearchedGroupId();
      return;
    }

    const projectId = new URLSearchParams(search).get('project');
    const groupId = new URLSearchParams(search).get('group');

    resetIfCleared(projectId, searchedProjectId, resetSearchedProjectId);
    resetIfCleared(groupId, searchedGroupId, resetSearchedGroupId);

    if (!projectId && !groupId) {
      return;
    }

    const project = projectRows.find((p) => p.id === projectId);
    const group = projectRows.find((g) => g.projectGroup === groupId);

    if (!project) {
      resetSearchedProjectId();
    }

    if (!group) {
      resetSearchedGroupId();
    }

    if (!project && !group) {
      return;
    }

    setPlanningRowState((current) => ({
      ...current,
      searchedProjectId: project?.id ?? '',
      searchedGroupId: group?.id ?? '',
      expanded: true,
    }));
  }, [
    search,
    projectRows,
    resetSearchedProjectId,
    resetSearchedGroupId,
    searchedProjectId,
    searchedGroupId,
  ]);

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

export default memo(PlanningRow);
