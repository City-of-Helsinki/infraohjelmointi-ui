import { Button } from 'hds-react/components/Button';
import { IconCheck, IconCross, IconPlaybackRecord } from 'hds-react/icons';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOptions } from '@/hooks/useOptions';
import { IPhaseMenuDetails } from '@/interfaces/common';
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
  const [selectedPhase, setSelectedPhase] = useState<string>(phase || '');

  const handleSetSelectedPhase = useCallback((nextPhase: string) => {
    setSelectedPhase(nextPhase);
  }, []);

  const onSubmit = useCallback(async () => {
    onSubmitPhase({ phase: selectedPhase });
    onCloseMenu();
  }, [onCloseMenu, onSubmitPhase, selectedPhase]);

  useEffect(() => {
    if (phase) {
      setSelectedPhase(phase);
    }
  }, [phase]);

  return (
    <div className="phase-menu-container">
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
            <button className="selection-button" onClick={() => handleSetSelectedPhase(value)}>
              <IconPlaybackRecord className="icon-width" />
              <p className={`item-text ${selectedPhase === value ? 'selected' : ''}`}>{label}</p>
            </button>
            {selectedPhase === value && <IconCheck className="icon-width check-icon" />}
          </li>
        ))}
      </ul>
      <div className="phase-menu-footer">
        <Button size="small" onClick={onSubmit}>
          {t('save')}
        </Button>
      </div>
    </div>
  );
};

export default memo(ProjectPhaseMenu);
