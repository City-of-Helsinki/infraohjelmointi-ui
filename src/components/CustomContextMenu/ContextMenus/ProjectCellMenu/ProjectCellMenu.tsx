import { useAppDispatch } from '@/hooks/common';
import { CellType, IOption } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { addYear, removeYear } from '@/utils/dates';
import { Button } from 'hds-react/components/Button';
import { IconCheck, IconCross } from 'hds-react/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';

const getSiblingProperty = (objectKey: string, previous?: boolean) => {
  const splitKey = objectKey.split('Plus');
  const nextNumber = previous ? parseInt(splitKey[1]) - 1 : parseInt(splitKey[1]) + 1;
  const baseKey = `${splitKey[0]}Plus`;
  return { nextNumber, baseKey };
};

const moveValueToNextProperty = (objectKey: string, project: IProject, previous?: boolean) => {
  const { nextNumber, baseKey } = getSiblingProperty(objectKey, previous);

  if (previous && nextNumber === 2 && baseKey === 'preliminaryCurrentYearPlus') {
    return {
      budgetProposalCurrentYearPlus2:
        parseInt(project.budgetProposalCurrentYearPlus2) +
        parseInt(project.preliminaryCurrentYearPlus3),
      [objectKey]: '0',
    };
  } else if (!previous && nextNumber > 2 && baseKey === 'budgetProposalCurrentYearPlus') {
    return {
      preliminaryCurrentYearPlus3:
        parseInt(project.budgetProposalCurrentYearPlus2) +
        parseInt(project.preliminaryCurrentYearPlus3),
      [objectKey]: '0',
    };
  } else {
    return {
      [`${baseKey}${nextNumber}`]:
        parseInt(project[objectKey as keyof IProject] as string) +
        parseInt(project[`${baseKey}${nextNumber}` as keyof IProject] as string),
      [objectKey]: '0',
    };
  }
};

const ProjectCellMenu = ({
  handleCloseMenu,
  project,
  year,
  cellType,
  objectKey,
}: {
  handleCloseMenu: () => void;
  project: IProject;
  year: number;
  cellType: CellType;
  objectKey: string;
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

  const handleEditTimeline = () => {
    Array.from(document.getElementById(`row-${project.id}`)?.children || []).forEach(
      (c) => c.tagName === 'TD' && c.classList.add('active'),
    );
  };

  const handleDeleteYear = () => {
    if (cellType === 'planning') {
      dispatch(
        silentPatchProjectThunk({
          id: project.id,
          data: {
            estPlanningStart: addYear(project.estPlanningStart),
            ...moveValueToNextProperty(objectKey, project),
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
            ...moveValueToNextProperty(objectKey, project, true),
          },
        }),
      );
    }
  };

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

export default ProjectCellMenu;
