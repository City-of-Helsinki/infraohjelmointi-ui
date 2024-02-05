import { useTranslation } from 'react-i18next';
import { CustomTag } from '@/components/shared';
import { useAppSelector } from '@/hooks/common';
import { selectIsProjectSaving, selectProject, selectProjectMode } from '@/reducers/projectSlice';
import moment from 'moment';
import './styles.css';

const SaveIndicator = () => {
  const { t } = useTranslation();
  const project = useAppSelector(selectProject);
  const isSaving = useAppSelector(selectIsProjectSaving);
  const updatedMoment = moment(project?.updatedDate).format('D.M.YYYY HH:mm:ss');
  const projectMode = useAppSelector(selectProjectMode);
  const updateText = projectMode === 'new' ? t('notSaved') : t('savedTime', { time: updatedMoment });

    return (
    <div className="mt-4 flex justify-start">
      <CustomTag
        color={'var(--color-success)'}
        text={isSaving ? t('saving') : updateText}
        weight={'light'}
        textColor={'var(--color-white)'}
        showLoading={isSaving}
      />
    </div>)
  }

export default SaveIndicator;
