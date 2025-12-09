import { useTranslation } from 'react-i18next';
import { getFieldProps } from './ProjectTalpaForm';
import FormSectionTitle from '@/components/shared/FormSectionTitle';
import DateField from '@/components/shared/DateField';
import { validateRequired } from '@/utils/validation';
import styles from './styles.module.css';

export default function ProjectScheduleSection() {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <FormSectionTitle label="projectTalpaForm.projectSchedule" name="projectSchedule" />
      <div className={styles.formRowWithColumns}>
        {/* Projektin aloituspäivämäärä */}
        <DateField
          {...getFieldProps('projectStart')}
          className="flex-1"
          size="full"
          rules={{ ...validateRequired('projectStart', t) }}
        />
        {/* Projektin lopetuspäivämäärä */}
        <DateField
          {...getFieldProps('projectEnd')}
          className="flex-1"
          size="full"
          helperText={t('projectTalpaForm.projectEndHelpText')}
          rules={{ ...validateRequired('projectEnd', t) }}
        />
      </div>
    </div>
  );
}
