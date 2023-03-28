import { CellType, IOption } from '@/interfaces/common';
import { Button } from 'hds-react/components/Button';
import { IconCheck, IconCross } from 'hds-react/icons';
import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';

interface IProjectCellMenuProps {
  onCloseMenu: () => void;
  title: string;
  year: number;
  cellType: CellType;
  onRemoveCell?: () => void;
  onEditCell?: () => void;
}

const ProjectCellMenu: FC<IProjectCellMenuProps> = ({
  onCloseMenu,
  title,
  year,
  cellType,
  onRemoveCell,
  onEditCell,
}) => {
  const { t } = useTranslation();
  const options: Array<IOption> = [
    { value: 'planning', label: 'Suunnittelu' },
    { value: 'construction', label: 'Rakentaminen' },
  ];

  const handleEditTimeline = useCallback(() => {
    onEditCell && onEditCell();
    onCloseMenu();
  }, [onCloseMenu, onEditCell]);

  const handleRemoveYear = useCallback(() => {
    onRemoveCell && onRemoveCell();
    onCloseMenu();
  }, [onCloseMenu, onRemoveCell]);

  return (
    <div className="project-cell-menu">
      <div className="project-cell-menu-header">
        <div className="overflow-hidden">
          <p className="title">{title}</p>
        </div>
        <IconCross className="close-icon" onClick={onCloseMenu} />
      </div>
      <div className="project-cell-menu-content">
        <p className="ml-1 font-bold">{year}</p>
        <ul className="py-2">
          {options.map(({ value, label }) => (
            <li key={value} className={`list-item ${value === cellType ? 'selected' : ''}`}>
              <div className="flex items-center">
                <div className={`list-icon ${value}`} />
                <span className={value === cellType ? 'font-bold' : 'font-light'}>{label}</span>
              </div>
              {value === cellType && <IconCheck />}
            </li>
          ))}
        </ul>
      </div>
      <div className="project-cell-menu-footer">
        <Button variant="supplementary" iconLeft={undefined} onClick={handleRemoveYear}>
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
