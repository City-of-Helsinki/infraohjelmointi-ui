import { planningListInfo } from '@/mocks/common';
import { IconInfoCircleFill } from 'hds-react/icons';
import { Button } from 'hds-react/components/Button';
import { useTranslation } from 'react-i18next';
import { Title } from '../shared';

const PlanningListInfoPanel = () => {
  const { t } = useTranslation();
  return (
    <div className="planning-list-info-panel">
      <div id="planningListTitle">
        <div>
          <Title text="budgetProposalPreparation" size="s" />
          <IconInfoCircleFill className="info-icon" />
        </div>
      </div>
      <div id="planningListButton">
        <Button variant="success">{t('allocationPreparation')}</Button>
        <span>{t('inProgressUntil', { planningListInfo })}</span>
      </div>

      <div id="planningListGroupInfo">
        <span className="group-info-text">{planningListInfo.group}</span>
        <span>{t('keur')}</span>
      </div>

      <div id="planningListBasicInfo">
        <span>{t('basicInfoKA')}</span>
      </div>
    </div>
  );
};

export default PlanningListInfoPanel;
