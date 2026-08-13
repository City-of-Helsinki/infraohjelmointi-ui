import { Dispatch, FC, SetStateAction } from 'react';
import { MyWorkloadViewType } from '@/interfaces/myWorkloadInterfaces';
import { useTranslation } from 'react-i18next';
import { IconHammers, IconScrollContent } from 'hds-react/icons';
import classes from './styles.module.css';

interface MyWorkloadViewTypeButtonsProps {
  viewType: MyWorkloadViewType;
  setViewType: Dispatch<SetStateAction<MyWorkloadViewType>>;
}

const MyWorkloadViewTypeButtons: FC<MyWorkloadViewTypeButtonsProps> = ({
  viewType,
  setViewType,
}) => {
  const { t } = useTranslation();

  return (
    <div className={classes.viewTypeButtonsContainer}>
      <button
        type="button"
        aria-pressed={viewType === 'construction'}
        className={`${classes.viewTypeButton} ${
          viewType === 'construction' ? classes.viewTypeButtonSelected : ''
        }`}
        disabled={viewType === 'construction'}
        onClick={() => setViewType('construction')}
      >
        <span>{t('myWorkloadView.viewTypeConstruction')}</span>
        <IconHammers aria-hidden="true" className={classes.viewTypeButtonIcon} />
      </button>
      <button
        type="button"
        aria-pressed={viewType === 'planning'}
        className={`${classes.viewTypeButton} ${
          viewType === 'planning' ? classes.viewTypeButtonSelected : ''
        }`}
        disabled={viewType === 'planning'}
        onClick={() => setViewType('planning')}
      >
        <span>{t('myWorkloadView.viewTypePlanning')}</span>
        <IconScrollContent aria-hidden="true" className={classes.viewTypeButtonIcon} />
      </button>
    </div>
  );
};

export default MyWorkloadViewTypeButtons;
