// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, useCallback, useEffect, useState } from 'react';
import PlanningCell from './PlanningCell';
import PlanningHead from './PlanningHead';
import { IPlanningCell, IPlanningRow } from '@/interfaces/planningInterfaces';
import ProjectRow from './ProjectRow/ProjectRow';
import { IProject } from '@/interfaces/projectInterfaces';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/common';
import { selectProjectUpdate } from '@/reducers/eventsSlice';
import { selectGroupsExpanded, selectStartYear } from '@/reducers/planningSlice';
import _ from 'lodash';
import './styles.css';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';
import { syncUpdatedProjectFinancesWithStartYear } from '@/utils/common';

interface IPlanningRowState {
  expanded: boolean;
  searchedProjectId: string;
}

const PlanningRow: FC<IPlanningRow & { sapCosts: Record<string, IProjectSapCost> }> = (props) => {
  const { defaultExpanded, projectRows, cells, id, type, sapCosts, children } = props;
  const projectToUpdateFromState = useAppSelector(selectProjectUpdate)?.project;
  const groupsExpanded = useAppSelector(selectGroupsExpanded);
  const startYear = useAppSelector(selectStartYear);
  const { search } = useLocation();

  const [planningRowState, setPlanningRowState] = useState<IPlanningRowState>({
    expanded: defaultExpanded,
    searchedProjectId: '',
  });

  const { expanded, /* projects, */ searchedProjectId } = planningRowState;

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
    if (type === 'group') {
      setPlanningRowState((current) => ({ ...current, expanded: groupsExpanded }));
    }
  }, [type, groupsExpanded]);

  // usePlanningRows-hook sets a projectToUpdate when the project-update event is triggered,
  // this useEffect updates the project in the view with the projecToUpdate
  useEffect(() => {
    if (!projectToUpdateFromState)
      return;

    const projectToUpdate: IProject = {...projectToUpdateFromState};

    if (projectToUpdate) {
      let inRow = false;
      let pIndex = -1;

      if (projectToUpdate.finances && startYear != projectToUpdate.finances.year) {
        projectToUpdate["finances"] = syncUpdatedProjectFinancesWithStartYear(projectToUpdate.finances, startYear);
      }

      // We add the project returned by the project-update event to a new "updatedProjects" list
      const updatedProjects = projectRows.map((p, index) => {
        if (p.id === projectToUpdate.id) {
          inRow = true;
          pIndex = index;
          return projectToUpdate;
        }
        return p;
      });

      // projectToUpdate does not already exist in this planning row if updatedProjects is the same check if project belongs to this row type
      if (!inRow) {
        const isGroupsProject =
          type === 'group' && projectToUpdate.projectGroup && id === projectToUpdate.projectGroup;

        const isLocationsProject =
          !projectToUpdate.projectGroup &&
          (type === 'district' || type === 'division') &&
          id === projectToUpdate.projectLocation;

        const isClassesProject =
          !projectToUpdate.projectLocation &&
          !projectToUpdate.projectGroup &&
          type.toLowerCase().includes('class') &&
          id === projectToUpdate.projectClass;

        if (isGroupsProject || isLocationsProject || isClassesProject) {
          updatedProjects.push(projectToUpdate);
        }
      }
      // updated project is in the current planning row check if the update has caused it to be removed from the row
      else if (
        (type === 'group' &&
          projectRows[pIndex].projectGroup === id &&
          !projectToUpdate.projectGroup) ||
        ((type === 'district' || type === 'division') &&
          projectToUpdate.projectGroup &&
          projectRows[pIndex].projectLocation === id) ||
        (type.toLowerCase().includes('class') &&
          projectToUpdate.projectGroup &&
          projectToUpdate.projectLocation &&
          projectRows[pIndex].projectClass === id)
      ) {
        updatedProjects.splice(pIndex, 1);
      } 

      // check if updated projects and projects are not equal and update the project currently displayed
      if (!_.isEqual(projectRows, updatedProjects)) {
        const sortedProjects = [...updatedProjects].sort((a, b) => a.name.localeCompare(b.name));
        setPlanningRowState((current) => ({
          ...current,
          projects: sortedProjects,
          expanded: true,
        }));
      }
    }
  }, [id, projectRows, projectToUpdateFromState, startYear, type]);

  const resetSearchedProjectId = useCallback(() => {
    setPlanningRowState((current) => ({ ...current, searchedProjectId: '' }));
  }, []);

  // Listens to the 'project' searchParam and sets the searchedProjectId and expanded to true if
  // the current row contains the project
  useEffect(() => {
    if (!search) {
      resetSearchedProjectId();
      return;
    }

    const projectId = new URLSearchParams(search).get('project');

    if (!projectId) {
      if (projectId !== searchedProjectId) {
        resetSearchedProjectId();
      }
      return;
    }

    const project = projectRows.filter((p) => p.id === projectId)[0];

    if (!project) {
      resetSearchedProjectId();
      return;
    }

    setPlanningRowState((current) => ({
      ...current,
      searchedProjectId: project.id,
      expanded: true,
    }));
  }, [search, projectRows, resetSearchedProjectId, searchedProjectId]);

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

/* districts' (suurpiiri) framebudget is not available on a subClass level in 'cells' even though it probably should, however 
  the data can be found one level lower from the childrens' 'cells'. The problem with the data might happen because the districts
  that are on the subclass level, are marked as projectGroup now and they probably should be projectClass instead. TODO: investigate
  the possible problem with projectGroup/projectClass */
  const cellDataWithFrameBudget = children[0]?.cells;
  const cellData = props.name.includes("suurpiiri") && cellDataWithFrameBudget && !search.includes("subClass") ? cellDataWithFrameBudget : cells;
  
  return (
    <>
      <tr className={props.type} data-testid={`row-${props.id}`}>
        <PlanningHead
          handleExpand={handleExpand}
          expanded={expanded}
          {...props}
          projectRows={projectRows}
        />
        {cellData.map((c: IPlanningCell) => (
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
