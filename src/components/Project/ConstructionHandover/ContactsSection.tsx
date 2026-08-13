import { FormSectionTitle, SelectField } from '@/components/shared';
import styles from '../ProjectTalpa/styles.module.css';
import { getFieldProps } from './ConstructionHandoverForm';
import { useOptions } from '@/hooks/useOptions';
import { validateRequiredSelect } from '@/utils/validation';
import { useTranslation } from 'react-i18next';

export default function ContactsSection() {
  const { t } = useTranslation();
  const responsiblePersons = useOptions('responsiblePersons');
  const programmers = useOptions('programmers');

  return (
    <div className="mb-12">
      <FormSectionTitle
        label="constructionHandoverForm.contacts"
        name="constructionHandoverContacts"
      />
      <div className={styles.formRowWithColumns}>
        <SelectField
          {...getFieldProps('personPlanning')}
          options={responsiblePersons}
          size="full"
          wrapperClassName="flex-1"
          required
          rules={{ ...validateRequiredSelect('person', t) }}
        />
        <SelectField
          {...getFieldProps('personFinancing')}
          options={programmers}
          size="full"
          wrapperClassName="flex-1"
          required
          rules={{ ...validateRequiredSelect('person', t) }}
        />
      </div>
    </div>
  );
}
