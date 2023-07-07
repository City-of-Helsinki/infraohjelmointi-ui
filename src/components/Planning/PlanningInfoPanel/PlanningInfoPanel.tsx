import { Button } from 'hds-react/components/Button';
import { useTranslation } from 'react-i18next';
import './styles.css';
import { IconAngleLeft } from 'hds-react/icons';
import { useLocation, useNavigate } from 'react-router';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectPlanningMode, selectSelections } from '@/reducers/planningSlice';
import { createSearchParams } from 'react-router-dom';

const PlanningInfoPanel = () => {
  const { t } = useTranslation();
  const mode = useAppSelector(selectPlanningMode);
  const selections = useAppSelector(selectSelections);
  const { selectedMasterClass } = selections;

  const { search } = useLocation();

  const navigate = useNavigate();

  const navigateBack = useCallback(() => {
    const {
      selectedMasterClass,
      selectedClass,
      selectedSubClass,
      selectedDistrict,
      selectedOtherClassification,
      selectedSubLevelDistrict,
      selectedCollectiveSubLevel,
    } = selections;

    const urlSearchParams = new URLSearchParams(search);

    if (selectedOtherClassification) {
      urlSearchParams.delete('otherClassification');
    } else if (selectedSubLevelDistrict) {
      urlSearchParams.delete('subLevelDistrict');
    } else if (selectedCollectiveSubLevel) {
      urlSearchParams.delete('collectiveSubLevel');
    } else if (selectedDistrict) {
      urlSearchParams.delete('district');
    } else if (selectedSubClass) {
      urlSearchParams.delete('subClass');
    } else if (selectedClass) {
      urlSearchParams.delete('class');
    } else if (selectedMasterClass) {
      urlSearchParams.delete('masterClass');
    }

    navigate({
      pathname: `/${mode}`,
      search: `${createSearchParams(urlSearchParams)}`,
    });
  }, [selections, search, navigate, mode]);

  const iconLeft = useMemo(() => <IconAngleLeft />, []);
  return (
    <div className="planning-info-panel-container">
      <div className="flex h-full">
        <div className="planning-info-panel">
          {/* Mode and previous button */}
          <div className="buttons-container">
            <div data-testid="mode-button-container">
              <Button className="h-11" variant="success" data-testid="mode-button">
                {t(mode)}
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
