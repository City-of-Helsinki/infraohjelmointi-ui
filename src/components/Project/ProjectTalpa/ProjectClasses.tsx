import { FormSectionTitle, NumberField, SelectField, TextField } from '@/components/shared';
import { getFieldProps } from './ProjectTalpaForm';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';

export default function ProjectClassesSection() {
  const { t } = useTranslation();

  return (
    <div className="mb-12">
      <FormSectionTitle {...getFieldProps('projectClasses')} />
      <SelectField
        {...getFieldProps('serviceClass')}
        options={[]}
        size="full"
        placeholder={t('projectTalpaForm.serviceClassPlaceholder')}
      />
      <SelectField
        {...getFieldProps('performanceClasses')}
        options={[]}
        size="full"
        placeholder={t('projectTalpaForm.performanceClassesPlaceholder')}
      />
      <TextField
        {...getFieldProps('profileName')}
        placeholder={t('projectTalpaForm.profileNamePlaceholder')}
        size="full"
      />
      <div className={styles.formRowWithColumns}>
        <NumberField {...getFieldProps('holdingTime')} size="full" />
        <TextField {...getFieldProps('investProfile')} size="full" />
        <TextField {...getFieldProps('readiness')} size="full" />
      </div>
    </div>
  );
}
