import { useTranslation } from 'react-i18next';
import { FormSectionTitle } from '@/components/shared';
import DateField from '@/components/shared/DateField';
import { getFieldProps } from './ConstructionHandoverForm';
import { validateRequired } from '@/utils/validation';
import TextAreaField from '@/components/shared/TextAreaField';
import { Tooltip } from 'hds-react';
import styles from '../ProjectTalpa/styles.module.css';

export default function ScheduleSection() {
  const { t } = useTranslation();

  return (
    <div className="mb-12">
      <FormSectionTitle label="constructionHandoverForm.projectSchedule" name="projectSchedule" />
      <div className={styles.formRowWithColumns}>
        <DateField
          {...getFieldProps('constructionStart')}
          className="flex-1"
          size="full"
          rules={{ ...validateRequired('constructionStart', t) }}
        />
        <DateField
          {...getFieldProps('constructionEnd')}
          className="flex-1"
          size="full"
          rules={{ ...validateRequired('constructionEnd', t) }}
        />
      </div>
      <TextAreaField
        {...getFieldProps('otherTimelineNotes')}
        tooltip={<Tooltip>{t('constructionHandoverForm.otherTimelineNotesTooltip')}</Tooltip>}
      />
    </div>
  );
}
