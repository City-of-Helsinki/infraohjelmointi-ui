import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconAlertCircleFill } from 'hds-react';
import _ from 'lodash';

const ErroSummary = () => {
  const { t } = useTranslation();

  return (
    <div className="error-summary-container" id="error-summary">
      <label className="error-summary-label">
        <IconAlertCircleFill color="#b01038" /> {t('validation.fieldsRequired')}
      </label>
      <ul className="error-summary-list">
        <li>
          {t('validation.errorNum', { number: 1 })}
          <a href={`#${'estPlanningStart'}`} className="error-summary-link">
            {t(`validation.${'estPlanningStart'}`)}
          </a>
        </li>
      </ul>
    </div>
  );
};

export default memo(ErroSummary);
