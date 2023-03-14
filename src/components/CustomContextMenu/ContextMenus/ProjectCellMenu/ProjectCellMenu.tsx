import { useAppDispatch } from '@/hooks/common';
import { CellType, IOption } from '@/interfaces/common';
import { IProject, IProjectRequest } from '@/interfaces/projectInterfaces';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { addYear, removeYear } from '@/utils/dates';
import { Button } from 'hds-react/components/Button';
import { IconCheck, IconCross } from 'hds-react/icons';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  addActiveClassToProjectRow,
  isProjectRowActive,
  removeActiveClassFromProjectRow,
} from '@/utils/common';
import './styles.css';

const getSiblingProperty = (cellKey: string, previous?: boolean) => {
  const splitKey = cellKey.split('Plus');
  const nextNumber = previous ? parseInt(splitKey[1]) - 1 : parseInt(splitKey[1]) + 1;
  const baseKey = `${splitKey[0]}Plus`;
  return { nextNumber, baseKey };
};

const moveValueToNextProperty = (
  cellKey: string,
  project: IProject,
  previous?: boolean,
): IProjectRequest => {
  const { nextNumber, baseKey } = getSiblingProperty(cellKey, previous);
  const req = {} as IProjectRequest;
  if (previous && nextNumber === 2 && baseKey === 'preliminaryCurrentYearPlus') {
    req.budgetProposalCurrentYearPlus2 = (
      parseInt(project.budgetProposalCurrentYearPlus2) +
      parseInt(project.preliminaryCurrentYearPlus3)
    ).toString();
  }
  if (!previous && nextNumber > 2 && baseKey === 'budgetProposalCurrentYearPlus') {
    req.preliminaryCurrentYearPlus3 = (
      parseInt(project.budgetProposalCurrentYearPlus2) +
      parseInt(project.preliminaryCurrentYearPlus3)
    ).toString();
  }
  return {
    ...req,
    [cellKey]: '0',
  };
};

const ProjectCellMenu = ({
  handleCloseMenu,
  project,
  year,
  cellType,
  cellKey,
}: {
  handleCloseMenu: () => void;
  project: IProject;
  year: number;
  cellType: CellType;
  cellKey: string;
}) => {
  const { t } = useTranslation();
  const [type, setType] = useState(cellType);
  const options: Array<IOption> = [
    { value: 'planning', label: 'Suunnittelu' },
    { value: 'construction', label: 'Rakentaminen' },
  ];

  const dispatch = useAppDispatch();

  useEffect(() => {
    setType(cellType);
  }, [cellType]);

  const handleEditTimeline = useCallback(() => {
    if (isProjectRowActive(project.id)) {
      removeActiveClassFromProjectRow(project.id);
    } else {
      addActiveClassToProjectRow(project.id);
    }
  }, [project]);

  const handleDeleteYear = useCallback(() => {
    if (cellType === 'planning') {
      dispatch(
        silentPatchProjectThunk({
          id: project.id,
          data: {
            estPlanningStart: addYear(project.estPlanningStart),
            ...moveValueToNextProperty(cellKey, project),
          },
        }),
      );
    }
    if (cellType === 'construction') {
      dispatch(
        silentPatchProjectThunk({
          id: project.id,
          data: {
            estConstructionEnd: removeYear(project.estConstructionEnd),
            ...moveValueToNextProperty(cellKey, project, true),
          },
        }),
      );
    }
  }, [cellType, dispatch, cellKey, project]);

  return (
    <div className="project-cell-menu">
      <div className="project-cell-menu-header">
        <div className="overflow-hidden">
          <p className="title">{project.name}</p>
        </div>
        <IconCross className="close-icon" onClick={handleCloseMenu} />
      </div>
      <div className="project-cell-menu-content">
        <p className="ml-1 font-bold">{year}</p>
        <ul className="py-2">
          {options.map(({ value, label }) => (
            <li key={value} className={`list-item ${value === type ? 'selected' : ''}`}>
              <div className="flex items-center">
                <div className={`list-icon ${value}`} />
                <span className={value === type ? 'font-bold' : 'font-light'}>{label}</span>
              </div>
              {value === type && <IconCheck />}
            </li>
          ))}
        </ul>
      </div>
      <div className="project-cell-menu-footer">
        <Button variant="supplementary" iconLeft={undefined} onClick={handleDeleteYear}>
          {t('removeYearFromTimeline')}
        </Button>
        <Button variant="supplementary" iconLeft={undefined} onClick={handleEditTimeline}>
          {t('editTimeline')}
        </Button>
      </div>
    </div>
  );
};

export default memo(ProjectCellMenu);
