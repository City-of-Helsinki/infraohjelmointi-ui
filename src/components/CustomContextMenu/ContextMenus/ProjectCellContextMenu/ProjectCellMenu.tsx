import { IOption } from '@/interfaces/common';
import { Button } from 'hds-react/components/Button';
import { IconCheck, IconCross } from 'hds-react/icons';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ICellMenuDetails } from '@/interfaces/eventInterfaces';
import { CellType } from '@/interfaces/projectInterfaces';

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
  const [selectedType, setSelectedType] = useState<CellType>('plan');
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

  return (
    <div className="project-cell-menu" data-testid="project-cell-menu">
      <div className="project-cell-menu-header">
        <div className="overflow-hidden">
          <p className="title" data-testid={'cell-title'}>
            {title}
          </p>
        </div>
        <IconCross
          className="close-icon"
          onClick={onCloseMenu}
          data-testid="close-project-cell-menu"
        />
      </div>
      <div className="project-cell-menu-content">
        <p className="ml-1 font-bold" data-testid={'cell-year'}>
          {year}
        </p>
        <ul className="py-2">
          {options.map(({ value, label }) => (
            <li
              key={value}
              className={`list-item ${value === selectedType ? 'selected' : ''}`}
              data-testid={`cell-type-${value}`}
            >
              <button
                className={`flex items-center ${!canTypeUpdate ? 'cursor-not-allowed' : ''}`}
                onClick={() => handleCellTypeUpdate(value as CellType)}
                disabled={!canTypeUpdate}
              >
                <div className={`list-icon ${value}`} />
                <span
                  className={` ${!canTypeUpdate ? 'text-gray' : ''} ${
                    value === selectedType ? 'font-bold text-black' : 'font-light'
                  }`}
                >
                  {label}
                </span>
              </button>
              {value === selectedType && <IconCheck />}
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
