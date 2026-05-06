import { FormSectionTitle, SelectField } from '@/components/shared';
import styles from '../ProjectTalpa/styles.module.css';
import { getFieldProps } from './ConstructionHandoverForm';
import { useOptions } from '@/hooks/useOptions';

export default function ContactsSection() {
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
        />
        <SelectField
          {...getFieldProps('personFinancing')}
          options={programmers}
          size="full"
          wrapperClassName="flex-1"
        />
      </div>
    </div>
  );
}
