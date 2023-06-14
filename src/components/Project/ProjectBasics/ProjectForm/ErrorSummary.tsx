import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconAlertCircleFill } from 'hds-react';
import _ from 'lodash';

interface IErrorSummaryProps {
  fields: Array<string>;
}
const ErroSummary: FC<IErrorSummaryProps> = ({ fields }) => {
  const { t } = useTranslation();

  return (
    <div className="error-summary-container" id="error-summary">
      <label className="error-summary-label">
        <IconAlertCircleFill color="#b01038" /> {t('validation.fieldsRequired')}
      </label>
      <ul className="error-summary-list">
        {fields.map((f) => (
          <li key={f}>
            {t('validation.errorNum', { number: 1 })}
            <a href={`#${f}`} className="error-summary-link">
              {t(`validation.${f}`)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default memo(ErroSummary);
