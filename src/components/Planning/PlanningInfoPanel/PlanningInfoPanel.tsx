import { Button } from 'hds-react/components/Button';
import { useTranslation } from 'react-i18next';
import './styles.css';
import { IconAngleLeft } from 'hds-react/icons';
import { useNavigate } from 'react-router';
import { FC, useCallback } from 'react';
import { IClass } from '@/interfaces/classInterfaces';

interface IPlanningInfoPanelProps {
  selectedMasterClass: IClass | null;
}

const PlanningInfoPanel: FC<IPlanningInfoPanelProps> = ({ selectedMasterClass }) => {
  const { t } = useTranslation();
  // const selectedMasterClass = useAppSelector(selectSelectedMasterClass);
  const navigate = useNavigate();

  const navigateBack = useCallback(() => {
    /**
     * FIXME:
     *
     * navigate('./'); should up one nested path but it removes all...
     * navigate(-1); goes back in history and can't be used here
     */
    navigate(-1);
  }, []);

  return (
    <div className="planning-info-panel">
      <div id="planningButton">
        <Button className="h-11" variant="success">
          {t('planning')}
        </Button>
      </div>

      <div id="selectedClass">
        {selectedMasterClass && (
          <>
            <span className="block text-sm font-bold">{selectedMasterClass.name}</span>
            <span className="block text-sm">{t('keur')}</span>
          </>
        )}
      </div>

      <div id="previousButton">
        {selectedMasterClass && (
          <Button onClick={navigateBack} variant="supplementary" iconLeft={<IconAngleLeft />}>
            {t('previous')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlanningInfoPanel;
