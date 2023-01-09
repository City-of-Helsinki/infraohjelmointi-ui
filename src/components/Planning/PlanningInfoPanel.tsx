import { planningInfo } from '@/mocks/common';
import { IconInfoCircleFill } from 'hds-react/icons';
import { Button } from 'hds-react/components/Button';
import { useTranslation } from 'react-i18next';
import { Title } from '../shared';

const PlanningInfoPanel = () => {
  const { t } = useTranslation();
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
        <span className="group-info-text">{planningInfo.group}</span>
        <span>{t('keur')}</span>
      </div>

      <div id="planningBasicInfo">
        <span>{t('basicInfoKA')}</span>
      </div>
    </div>
  );
};

export default PlanningInfoPanel;
