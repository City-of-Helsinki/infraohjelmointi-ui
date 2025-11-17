import { useTranslation } from 'react-i18next';
import { FormSectionTitle, TextField } from '@/components/shared';
import { getFieldProps } from './ProjectTalpaForm';
import { validateRequired } from '@/utils/validation';
import styles from './styles.module.css';

export default function ProjectContactsSection() {
  const { t } = useTranslation();

  return (
    <div className="mb-12">
      <FormSectionTitle {...getFieldProps('projectContacts')} />
      <div className={styles.formRowWithColumns}>
        <TextField
          {...getFieldProps('streetAddress')}
          wrapperClassName="flex-1"
          size="full"
          rules={{ ...validateRequired('streetAddress', t) }}
          placeholder={t('projectTalpaForm.streetAddressPlaceholder')}
        />
        <TextField
          {...getFieldProps('postalCode')}
          wrapperClassName="flex-1"
          size="full"
          rules={{ ...validateRequired('postalCode', t) }}
        />
      </div>
      <div className={styles.formRowWithColumns}>
        <TextField
          {...getFieldProps('contactPerson')}
          wrapperClassName="flex-1"
          size="full"
          rules={{ ...validateRequired('contactPerson', t) }}
          placeholder={t('projectTalpaForm.contactPersonPlaceholder')}
        />
        <TextField
          {...getFieldProps('contactEmail')}
          wrapperClassName="flex-1"
          size="full"
          rules={{ ...validateRequired('contactEmail', t) }}
          placeholder={t('projectTalpaForm.contactEmailPlaceholder')}
        />
      </div>
    </div>
  );
}
