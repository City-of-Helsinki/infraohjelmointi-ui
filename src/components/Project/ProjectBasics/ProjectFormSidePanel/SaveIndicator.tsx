import { StatusLabel } from 'hds-react/components/StatusLabel';
import { IconSaveDiskette } from 'hds-react/icons';
import { useAppSelector } from '@/hooks/common';
import { useTranslation } from 'react-i18next';
import { selectUpdated } from '@/reducers/projectSlice';
import './styles.css';

const SaveIndicator = () => {
  const updated = useAppSelector(selectUpdated);
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex justify-center">
      <div className="side-nav">
        <StatusLabel className="save-icon" type="success" iconLeft={<IconSaveDiskette />}>
          {t('savedTime', { time: updated })}
        </StatusLabel>
      </div>
    </div>
  );
};

export default SaveIndicator;
