import { Button, ButtonSize } from 'hds-react';
import { IconCheck, IconCross } from 'hds-react/icons';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOptions } from '@/hooks/useOptions';
import { IPhaseMenuDetails } from '@/interfaces/eventInterfaces';
import optionIcon from '@/utils/optionIcon';
import { useAppSelector } from '@/hooks/common';
import { selectUser } from '@/reducers/authSlice';
import { isUserOnlyViewer } from '@/utils/userRoleHelpers';
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
  const user = useAppSelector(selectUser);
  const isOnlyViewer = isUserOnlyViewer(user);
  const [selectedPhase, setSelectedPhase] = useState<string>(phase ?? '');

  useEffect(() => {
    if (phase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- render-phase setState breaks useSelector in React 18.2 (facebook/react#25565)
      setSelectedPhase(phase);
    }
  }, [phase]);

  const handleSetSelectedPhase = useCallback((nextPhase: string) => {
    setSelectedPhase(nextPhase);
  }, []);

  const onSubmit = useCallback(() => {
    if (isOnlyViewer) {
      return;
    }
    onSubmitPhase({ phase: selectedPhase });
    onCloseMenu();
  }, [isOnlyViewer, onCloseMenu, onSubmitPhase, selectedPhase]);

  return (
    <div className="phase-menu-container" data-testid={'project-phase-menu'}>
      <div className="phase-menu-header">
        <div className="overflow-hidden">
          <p className="title">{title}</p>
          <p className="description">{t('currentStatus')}</p>
        </div>
        <button className="close-icon" onClick={onCloseMenu}>
          <IconCross />
        </button>
      </div>
      <ul className="phase-menu-list">
        {phases.map(({ value, label }) => (
          <li key={value} className={`list-item ${selectedPhase === value ? 'selected' : ''}`}>
            <button
              className="selection-button"
              data-testid={`select-${value}`}
              disabled={isOnlyViewer}
              onClick={() => handleSetSelectedPhase(value)}
            >
              <div className="min-w-[2rem]">{optionIcon[label as keyof typeof optionIcon]}</div>
              <p
                className={`item-text ${selectedPhase === value ? 'selected' : ''}`}
                data-testid={`project-phase-menu-option-${value}`}
              >
                {t(`option.${label}`)}
              </p>
            </button>
            {selectedPhase === value && <IconCheck className="icon-width check-icon" />}
          </li>
        ))}
      </ul>
      {!isOnlyViewer && (
        <div className="phase-menu-footer">
          <Button size={ButtonSize.Small} onClick={onSubmit} data-testid="patch-project-phase">
            {t('save')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default memo(ProjectPhaseMenu);
