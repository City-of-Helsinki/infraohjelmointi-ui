import { IOption } from '@/interfaces/common';
import { Button } from 'hds-react/components/Button';
import { IconCheck, IconCross } from 'hds-react/icons';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ICellMenuDetails } from '@/interfaces/eventInterfaces';
import { CellType } from '@/interfaces/projectInterfaces';
import './styles.css';

interface IProjectCellMenuProps extends ICellMenuDetails {
  onCloseMenu: () => void;
}

const ProjectCellMenu: FC<IProjectCellMenuProps> = ({
  onCloseMenu,
  title,
  year,
  cellType,
  onRemoveCell,
  onEditCell,
  onUpdateCellType,
  canTypeUpdate,
}) => {
  const [selectedType, setSelectedType] = useState<CellType>('planning');
  useEffect(() => {
    setSelectedType(cellType);
  }, [cellType]);
  const { t } = useTranslation();
  const options: Array<IOption> = [
    { value: 'planning', label: 'Suunnittelu' },
    { value: 'construction', label: 'Rakentaminen' },
  ];

  const handleCellTypeUpdate = useCallback(
    (type: CellType) => {
      setSelectedType(type);
      onUpdateCellType(type);
      onCloseMenu();
    },
    [onUpdateCellType, onCloseMenu],
  );

  const handleEditTimeline = useCallback(() => {
    onEditCell();
    onCloseMenu();
  }, [onCloseMenu, onEditCell]);

  const handleRemoveYear = useCallback(() => {
    onRemoveCell();
    onCloseMenu();
  }, [onCloseMenu, onRemoveCell]);

  const isSelected = useCallback(
    (value: string) => value === selectedType || cellType === 'overlap',
    [cellType, selectedType],
  );

  const isPhaseChangeDisabled = useCallback(
    (value: string) => !canTypeUpdate || value === selectedType,
    [canTypeUpdate, selectedType],
  );

  return (
    <div className="project-cell-menu" data-testid="project-cell-menu">
      <div className="project-cell-menu-header">
        <div className="overflow-hidden">
          <p className="title" data-testid={'cell-title'}>
            {title}
          </p>
        </div>
        <button
          onClick={onCloseMenu}
          className="close-icon"
          data-testid="close-project-cell-pappdiin"
        >
          <IconCross />
        </button>
      </div>
      <div className="project-cell-menu-content">
        <p className="ml-1 font-bold" data-testid={'cell-year'}>
          {year}
        </p>
        <ul className="py-2">
          {options.map(({ value, label }) => (
            <li
              key={value}
              className={`list-item ${isSelected(value) ? 'selected' : ''}`}
              data-testid={`cell-type-${value}`}
            >
              <button
                className={'project-phase-button'}
                onClick={() => handleCellTypeUpdate(value as CellType)}
                disabled={isPhaseChangeDisabled(value)}
                data-testid={`update-cell-type-to-${value}`}
              >
                <div className={`list-icon ${value}`} />
                <span
                  className={` ${!canTypeUpdate && !isSelected(value) ? 'text-gray' : ''} ${
                    isSelected(value) ? 'font-bold text-black' : 'font-light'
                  }`}
                >
                  {label}
                </span>
              </button>
              {isSelected(value) && <IconCheck />}
            </li>
          ))}
        </ul>
      </div>
      <div className="project-cell-menu-footer">
        <Button
          variant="supplementary"
          iconLeft={undefined}
          onClick={handleRemoveYear}
          data-testid="remove-year-button"
        >
          {t('removeYearFromTimeline')}
        </Button>
        <Button
          variant="supplementary"
          iconLeft={undefined}
          onClick={handleEditTimeline}
          data-testid="edit-year-button"
        >
          {t('editTimeline')}
        </Button>
      </div>
    </div>
  );
};

export default memo(ProjectCellMenu);
