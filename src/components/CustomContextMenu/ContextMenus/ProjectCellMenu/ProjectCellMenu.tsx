import { useAppDispatch } from '@/hooks/common';
import { CellType, IOption } from '@/interfaces/common';
import { IProject, IProjectRequest } from '@/interfaces/projectInterfaces';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { addYear, removeYear } from '@/utils/dates';
import { Button } from 'hds-react/components/Button';
import { IconCheck, IconCross } from 'hds-react/icons';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  addActiveClassToProjectRow,
  isProjectRowActive,
  removeActiveClassFromProjectRow,
} from '@/utils/common';
import './styles.css';

/**
 * Returns the budget key next to the given key, if the previous parameter is given then the previous
 * key will be returned, otherwise the next key is returned.
 *
 * @param budgetKey the budget key to compare
 * @param previous optional boolean if the previous year should be used
 */
const getNextBudgetKey = (budgetKey: string, previous?: boolean) => {
  const splitKey = budgetKey.split('Plus');
  const baseKey = `${splitKey[0]}Plus`;
  return `${baseKey}${previous ? parseInt(splitKey[1]) - 1 : parseInt(splitKey[1]) + 1}`;
};

/**
 * Moves the value of the given budget key to either the next property or the previous property if the
 * previous parameter is given.
 *
 * @param budgetKey the current budget key which value will be moved
 * @param project the project to update
 * @param previous optional boolean if the previous year should be used
 *
 * @returns IProjectRequest-object with the given key/properties budget moved to the next property
 */
const moveBudgetToNextProperty = (
  budgetKey: string,
  project: IProject,
  previous?: boolean,
): IProjectRequest => {
  const nextKey = getNextBudgetKey(budgetKey, previous);
  const req = {} as IProjectRequest;

  // The project properties go from budgetProposal...0, 1, 2 and then preliminaryCurrent...3, 4, 5...,
  // so we need to check if the next property would become a property that doesn't exist
  // (i.e. budgetProposalCurrentYearPlus3 or preliminaryCurrentYearPlus2)
  if (nextKey === 'preliminaryCurrentYearPlus2') {
    req.budgetProposalCurrentYearPlus2 = (
      parseInt(project.budgetProposalCurrentYearPlus2) +
      parseInt(project.preliminaryCurrentYearPlus3)
    ).toString();
  } else if (nextKey === 'budgetProposalCurrentYearPlus3') {
    req.preliminaryCurrentYearPlus3 = (
      parseInt(project.budgetProposalCurrentYearPlus2) +
      parseInt(project.preliminaryCurrentYearPlus3)
    ).toString();
  } else {
    (req[nextKey as keyof IProjectRequest] as string) = (
      parseInt(project[budgetKey as keyof IProject] as string) +
      parseInt(project[nextKey as keyof IProject] as string)
    ).toString();
  }
  return {
    ...req,
    [budgetKey]: '0',
  };
};

interface IProjectCellMenuProps {
  handleCloseMenu: () => void;
  project: IProject;
  budgetKey: string;
  year: number;
  cellType: CellType;
}

/**
 * This component relies on the project budget properties for the current year and the next 10 years to be the following,
 * since it adds/removes values from them dynamically using the number at the end of the key:
 *
 * - budgetProposalCurrentYearPlus0 (current year)
 * - ...
 * - budgetProposalCurrentYearPlus2
 * - preliminaryCurrentYearPlus3
 * - ...
 * - preliminaryCurrentYearPlus10 (10 years in the future)
 *
 */
const ProjectCellMenu: FC<IProjectCellMenuProps> = ({
  handleCloseMenu,
  project,
  year,
  cellType,
  budgetKey,
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

  // Sets or removes an .active css-class to all the TD-elements for the selected project row
  const handleEditTimeline = useCallback(() => {
    if (isProjectRowActive(project.id)) {
      removeActiveClassFromProjectRow(project.id);
    } else {
      addActiveClassToProjectRow(project.id);
    }
    handleCloseMenu();
  }, [project]);

  // Removes or adds a 1 year to the projects planning/construction start/end and
  // moves the removed properties budget to the next budget
  const handleDeleteYear = useCallback(() => {
    const isPlanning = cellType === 'planning';
    const isConstruction = cellType === 'construction';
    const { estPlanningStart, estConstructionEnd } = project;

    dispatch(
      silentPatchProjectThunk({
        id: project.id,
        data: {
          ...(isPlanning && { estPlanningStart: addYear(estPlanningStart) }),
          ...(isConstruction && { estConstructionEnd: removeYear(estConstructionEnd) }),
          ...moveBudgetToNextProperty(budgetKey, project, isConstruction),
        },
      }),
    ).then(() => handleCloseMenu());
  }, [cellType, dispatch, budgetKey, project]);

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
