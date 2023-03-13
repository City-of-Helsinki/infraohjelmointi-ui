import { Button } from 'hds-react/components/Button';
import { useTranslation } from 'react-i18next';
import './styles.css';
import { useAppSelector } from '@/hooks/common';
import { selectSelectedMasterClass } from '@/reducers/classSlice';
import { IconAngleLeft } from 'hds-react/icons';
import { useNavigate } from 'react-router';
import { useCallback } from 'react';
import { CustomContextMenu } from '@/components/CustomContextMenu';

const PlanningInfoPanel = () => {
  const { t } = useTranslation();
  const selectedMasterClass = useAppSelector(selectSelectedMasterClass);
  const navigate = useNavigate();

  const navigateBack = useCallback(() => {
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

      <div
        id="editCellMenu"
        style={{
          background: 'red',
          height: '100px',
          width: '100px',
          gridRow: '1',
          marginLeft: '10px',
        }}
      >
        <CustomContextMenu targetId="editCellMenu" />
      </div>
    </div>
  );
};

export default PlanningInfoPanel;
