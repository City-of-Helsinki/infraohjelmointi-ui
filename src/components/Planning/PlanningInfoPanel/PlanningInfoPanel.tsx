import { planningInfo } from '@/mocks/common';
import { IconInfoCircleFill } from 'hds-react/icons';
import { Button } from 'hds-react/components/Button';
import { useTranslation } from 'react-i18next';
import { Title } from '../../shared';
import './styles.css';
import { useAppSelector } from '@/hooks/common';
import { selectSelectedMasterClass } from '@/reducers/classSlice';

const PlanningInfoPanel = () => {
  const { t } = useTranslation();
  const selectedMasterClass = useAppSelector(selectSelectedMasterClass);

  return (
    <div className="planning-info-panel">
      <div id="planningTitle">
        <div>
          <Title text="budgetProposalPreparation" size="s" />
          <IconInfoCircleFill className="info-icon" />
        </div>
      </div>
      <div id="planningButton">
        <Button variant="success">{t('allocationPreparation')}</Button>
        <span>{t('inProgressUntil', { planningInfo })}</span>
      </div>

      <div id="planningGroupInfo">
        {selectedMasterClass && (
          <>
            <span className="group-info-text">{selectedMasterClass.name}</span>
            <span>{t('keur')}</span>
          </>
        )}
      </div>

      <div id="planningBasicInfo">
        <span>{t('basicInfoKA')}</span>
      </div>
    </div>
  );
};

export default PlanningInfoPanel;
