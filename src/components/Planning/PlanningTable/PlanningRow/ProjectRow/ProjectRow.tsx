import { IProject } from '@/interfaces/projectInterfaces';
import { FC, memo, useCallback, useRef } from 'react';
import ProjectCell from './ProjectCell';
import useProjectRow from '@/hooks/useProjectRow';
import useClickOutsideRef from '@/hooks/useClickOutsideRef';
import ProjectHead from './ProjectHead';
import './styles.css';

interface IProjectRowProps {
  project: IProject;
  isSearched?: boolean;
  parentId: string;
}

const ProjectRow: FC<IProjectRowProps> = ({ project, isSearched, parentId }) => {
  const projectRowRef = useRef<HTMLTableRowElement>(null);
  const { cells, sums, projectFinances } = useProjectRow(project);

  // Remove the active css-class from the current row if the user clicks outside of it
  useClickOutsideRef(
    projectRowRef,
    useCallback(() => {
      if (projectRowRef?.current?.classList.contains('active')) {
        projectRowRef.current.classList.remove('active');
      }
    }, []),
  );

  return (
    <tr
      id={`project-row-${project.id}`}
      ref={projectRowRef}
      data-testid={`row-${project.id}-parent-${parentId}`}
      className={`project-row ${isSearched ? 'searched' : ''}`}
    >
      {/* HEADER */}
      <ProjectHead project={project} sums={sums} />
      {cells.map((c) => (
        <ProjectCell key={c.financeKey} cell={c} projectFinances={projectFinances} />
      ))}
    </tr>
  );
};

export default memo(ProjectRow);
