import { useTranslation } from 'react-i18next';
import { FormSectionTitle, TextField } from '@/components/shared';
import { getFieldProps } from './ProjectTalpaForm';
import { validateEmail, validateRequired } from '@/utils/validation';
import styles from './styles.module.css';

export default function ProjectContactsSection() {
  const { t } = useTranslation();

  return (
    <div className="mb-12">
      <FormSectionTitle label="projectTalpaForm.projectContacts" name="projectContacts" />
      <div className={styles.formRowWithColumns}>
        {/* Katuosoite */}
        <TextField
          {...getFieldProps('streetAddress')}
          wrapperClassName="flex-1"
          size="full"
          rules={{ ...validateRequired('streetAddress', t) }}
          placeholder={t('projectTalpaForm.streetAddressPlaceholder')}
        />
        {/* Postinumero */}
        <TextField
          {...getFieldProps('postalCode')}
          wrapperClassName="flex-1"
          size="full"
          rules={{ ...validateRequired('postalCode', t) }}
        />
      </div>
      <div className={styles.formRowWithColumns}>
        {/* Vastuuhenkilö */}
        <TextField
          {...getFieldProps('responsiblePerson')}
          wrapperClassName="flex-1"
          size="full"
          rules={{ ...validateRequired('responsiblePerson', t) }}
          placeholder={t('projectTalpaForm.responsiblePersonPlaceholder')}
        />
        {/* Vastuuhenkilön sähköposti */}
        <TextField
          {...getFieldProps('responsiblePersonEmail')}
          wrapperClassName="flex-1"
          size="full"
          rules={{ ...validateRequired('responsiblePersonEmail', t), ...validateEmail(t) }}
          placeholder={t('projectTalpaForm.responsiblePersonEmailPlaceholder')}
        />
      </div>
    </div>
  );
}
