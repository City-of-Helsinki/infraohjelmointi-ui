import { IProject } from '@/interfaces/projectInterfaces';
import { FC, memo, useMemo } from 'react';
import ProjectCell from './ProjectCell';
import useProjectRow from '@/hooks/useProjectRow';
import ProjectHead from './ProjectHead';
import './styles.css';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';
import { useAppSelector } from '@/hooks/common';
import {
  selectChangeHistoryEnabled,
  selectForcedToFrame,
  selectSelectedYears,
  selectSelections,
} from '@/reducers/planningSlice';
import { selectUser } from '@/reducers/authSlice';
import { isUserOnlyProjectAreaPlanner, isUserOnlyViewer } from '@/utils/userRoleHelpers';
import { usePatchProjectMutation } from '@/api/projectApi';
import useRestrictedClassAccess from '@/hooks/useRestrictedClassAccess';

interface IProjectRowProps {
  project: IProject;
  isSearched?: boolean;
  parentId: string;
  sapCosts: Record<string, IProjectSapCost>;
}

const ProjectRow: FC<IProjectRowProps> = ({ project, isSearched, parentId, sapCosts }) => {
  const { cells, sums, projectFinances } = useProjectRow(project, sapCosts[project.id]);
  const selectedYears = useAppSelector(selectSelectedYears);
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const changeHistoryEnabled = useAppSelector(selectChangeHistoryEnabled);
  const user = useAppSelector(selectUser);
  const selectedMasterClass = useAppSelector(
    (state) => selectSelections(state).selectedMasterClass,
  );
  const { canEditClass } = useRestrictedClassAccess();
  const [patchProject] = usePatchProjectMutation();

  const isEditingDisabledForUser = useMemo(() => {
    if (!canEditClass(project.projectClass)) {
      return true;
    }

    // Project area planner can only edit projects under masterclass 808
    if (isUserOnlyProjectAreaPlanner(user)) {
      return !(
        selectedMasterClass?.name.startsWith('808') || selectedMasterClass?.name.startsWith('8 08')
      );
    }

    // Disable editing project budgets if user is only a viewer
    return isUserOnlyViewer(user);
  }, [user, selectedMasterClass, canEditClass, project.projectClass]);

  const isReadOnly = isUserOnlyViewer(user) || !canEditClass(project.projectClass);

  return (
    <tr
      id={`project-row-${project.id}`}
      data-testid={`row-${project.id}-parent-${parentId}`}
      className={`project-row ${isSearched ? 'searched' : ''}`}
    >
      {/* HEADER */}
      <ProjectHead
        project={project}
        sums={sums}
        isReadOnly={isReadOnly}
        patchProject={patchProject}
      />
      {cells.map((c) => (
        <ProjectCell
          key={c.financeKey}
          cell={c}
          projectFinances={projectFinances}
          sapProject={project.sapProject}
          isSelectedYear={selectedYears.includes(c.year)}
          forcedToFrame={forcedToFrame}
          changeHistoryEnabled={changeHistoryEnabled}
          isEditingDisabledForUser={isEditingDisabledForUser}
          patchProject={patchProject}
        />
      ))}
    </tr>
  );
};

export default memo(ProjectRow);
