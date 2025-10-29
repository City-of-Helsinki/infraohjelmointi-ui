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
}

const PlanningRow: FC<
  IPlanningRow & {
    sapCosts: Record<string, IProjectSapCost>;
    sapCurrentYear: Record<string, IProjectSapCost>;
  }
> = (props) => {
  const { defaultExpanded, projectRows, cells, id, type, sapCosts, sapCurrentYear } = props;
  const groupsExpanded = useAppSelector(selectGroupsExpanded);
  const { search } = useLocation();

  const [planningRowState, setPlanningRowState] = useState<IPlanningRowState>({
    expanded: defaultExpanded,
    searchedProjectId: '',
  });

  const { expanded, searchedProjectId } = planningRowState;

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
  }, [type, groupsExpanded, searchedProjectId]);

  // Listens to the 'project' searchParam and sets the searchedProjectId and expanded to true if
  // the current row contains the project
  useEffect(() => {
    if (!search) {
      setPlanningRowState((current) => ({ ...current, searchedProjectId: '' }));
      return;
    }

    const projectId = new URLSearchParams(search).get('project');

    if (!projectId) {
      setPlanningRowState((current) => ({ ...current, searchedProjectId: '' }));
      return;
    }

    const project = projectRows.filter((p) => p.id === projectId)[0];

    if (!project) {
      setPlanningRowState((current) => ({ ...current, searchedProjectId: '' }));
      return;
    }

    setPlanningRowState((current) => ({
      ...current,
      searchedProjectId: project.id,
      expanded: true,
    }));
  }, [search, projectRows]);

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
              sapCurrentYear={sapCurrentYear}
            />
          ))}
          {/* Render the rows recursively for each childRows */}
          {props.children.map((c) => (
            <PlanningRow {...c} sapCosts={sapCosts} sapCurrentYear={sapCurrentYear} />
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningRow);
