import { Button } from 'hds-react/components/Button';
import { useTranslation } from 'react-i18next';
import './styles.css';
import { IconAngleLeft } from 'hds-react/icons';
import { useNavigate } from 'react-router';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectSelections } from '@/reducers/planningSlice';

const PlanningInfoPanel = () => {
  const { t } = useTranslation();
  const { selectedMasterClass } = useAppSelector(selectSelections);

  const navigate = useNavigate();

  const navigateBack = useCallback(() => {
    const routes = window.location.pathname.split('/');
    routes.pop();
    navigate(routes.join('/'));
  }, []);

  const iconLeft = useMemo(() => <IconAngleLeft />, []);
  return (
    <div className="planning-info-panel-container">
      <div className="flex h-full">
        <div className="planning-info-panel">
          {/* Mode and previous button */}
          <div className="buttons-container">
            <div data-testid="mode-button-container">
              <Button className="h-11" variant="success" data-testid="mode-button">
                {t('planning')}
              </Button>
            </div>
            <div id="previousButton" data-testid="previous-button-container">
              {selectedMasterClass && (
                <Button
                  data-testid="previous-button"
                  onClick={navigateBack}
                  variant="supplementary"
                  iconLeft={iconLeft}
                >
                  {t('previous')}
                </Button>
              )}
            </div>
          </div>
          {/* Selected class name */}
          <div className="selected-class-container" data-testid="selected-class-container">
            {selectedMasterClass && (
              <div className="overflow-hidden">
                <span id="selectedClass" className="selected-class" data-testid="selected-class">
                  {selectedMasterClass.name}
                </span>
                <span className="block text-sm" data-testid="currency-indicator">
                  {t('keur')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningInfoPanel;
