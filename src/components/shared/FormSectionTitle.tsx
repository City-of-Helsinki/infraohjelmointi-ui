import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

interface IFormSectionTitleProps {
  name?: string;
  label?: string;
}
const FormSectionTitle: FC<IFormSectionTitleProps> = ({ label, name }) => {
  const { t } = useTranslation();
  return (
    <div className="input-wrapper" id={'formTitle'}>
      <h3 className="text-heading-m" id={name}>
        {t(label ?? '')}
      </h3>
    </div>
  );
};

export default memo(FormSectionTitle);
