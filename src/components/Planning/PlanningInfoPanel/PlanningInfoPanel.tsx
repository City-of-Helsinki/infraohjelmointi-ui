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

  const navigate = useNavigate();
  const navigateBack = useCallback(() => navigate(-1), []);

  return (
    <div className="planning-info-panel">
      <div id="planningButton" data-testid="mode-button-container">
        <Button className="h-11" variant="success" data-testid="mode-button">
          {t('planning')}
        </Button>
      </div>

      <div id="selectedClass" data-testid="selected-class-container">
        {selectedMasterClass && (
          <>
            <span className="block text-sm font-bold" data-testid="selected-class">
              {selectedMasterClass.name}
            </span>
            <span className="block text-sm" data-testid="currency-indicator">
              {t('keur')}
            </span>
          </>
        )}
      </div>

      <div id="previousButton" data-testid="previous-button-container">
        {selectedMasterClass && (
          <Button
            data-testid="previous-button"
            onClick={navigateBack}
            variant="supplementary"
            iconLeft={<IconAngleLeft />}
          >
            {t('previous')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlanningInfoPanel;
