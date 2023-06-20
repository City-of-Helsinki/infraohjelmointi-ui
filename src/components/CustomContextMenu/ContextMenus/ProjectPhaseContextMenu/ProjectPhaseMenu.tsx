import { Button } from 'hds-react/components/Button';
import { IconCheck, IconCross } from 'hds-react/icons';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOptions } from '@/hooks/useOptions';
import { IPhaseMenuDetails } from '@/interfaces/eventInterfaces';
import optionIcon from '@/utils/optionIcon';
import './styles.css';

interface IProjectPhaseMenuProps extends IPhaseMenuDetails {
  onCloseMenu: () => void;
}

const ProjectPhaseMenu: FC<IProjectPhaseMenuProps> = ({
  title,
  phase,
  onCloseMenu,
  onSubmitPhase,
}) => {
  const { t } = useTranslation();
  const phases = useOptions('phases');
  const [selectedPhase, setSelectedPhase] = useState<string>(phase ?? '');

  const handleSetSelectedPhase = useCallback((nextPhase: string) => {
    setSelectedPhase(nextPhase);
  }, []);

  const onSubmit = useCallback(() => {
    onSubmitPhase({ phase: selectedPhase });
    onCloseMenu();
  }, [onCloseMenu, onSubmitPhase, selectedPhase]);

  useEffect(() => {
    if (phase) {
      setSelectedPhase(phase);
    }
  }, [phase]);

  return (
    <div className="phase-menu-container" data-testid={'project-phase-menu'}>
      <div className="phase-menu-header">
        <div className="overflow-hidden">
          <p className="title">{title}</p>
          <p className="description">{t('currentStatus')}</p>
        </div>
        <IconCross className="close-icon" onClick={onCloseMenu} />
      </div>
      <ul className="phase-menu-list">
        {phases.map(({ value, label }) => (
          <li key={value} className={`list-item ${selectedPhase === value ? 'selected' : ''}`}>
            <button
              className="selection-button"
              data-testid={`select-${value}`}
              onClick={() => handleSetSelectedPhase(value)}
            >
              <div className="min-w-[2rem]">{optionIcon[label as keyof typeof optionIcon]}</div>
              <p
                className={`item-text ${selectedPhase === value ? 'selected' : ''}`}
                data-testid={`project-phase-menu-option-${value}`}
              >
                {t(label)}
              </p>
            </button>
            {selectedPhase === value && <IconCheck className="icon-width check-icon" />}
          </li>
        ))}
      </ul>
      <div className="phase-menu-footer">
        <Button size="small" onClick={onSubmit} data-testid="patch-project-phase">
          {t('save')}
        </Button>
      </div>
    </div>
  );
};

export default memo(ProjectPhaseMenu);
