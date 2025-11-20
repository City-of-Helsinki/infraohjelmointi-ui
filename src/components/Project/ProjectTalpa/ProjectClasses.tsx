import { FormSectionTitle, NumberField, SelectField, TextField } from '@/components/shared';
import { getFieldProps } from './ProjectTalpaForm';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';

export default function ProjectClassesSection() {
  const { t } = useTranslation();

  return (
    <div className="mb-12">
      <FormSectionTitle label="projectTalpaForm.projectClasses" name="projectClasses" />
      {/* Palveluluokka */}
      <SelectField
        {...getFieldProps('serviceClass')}
        options={[]}
        size="full"
        placeholder={t('projectTalpaForm.serviceClassPlaceholder')}
      />
      {/* Käyttöomaisuusluokka */}
      <SelectField
        {...getFieldProps('assetClasses')}
        options={[]}
        size="full"
        placeholder={t('projectTalpaForm.assetClassesPlaceholder')}
      />
      {/* Proﬁiilin nimi */}
      <TextField {...getFieldProps('profileName')} size="full" />
      <div className={styles.formRowWithColumns}>
        {/* Pitoaika */}
        <NumberField {...getFieldProps('holdingTime')} size="full" />
        {/* Investointiproﬁli */}
        <TextField {...getFieldProps('investmentProfile')} size="full" />
        {/* Valmius */}
        <TextField {...getFieldProps('readiness')} size="full" />
      </div>
    </div>
  );
}
