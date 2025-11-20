import useTalpaForm from '@/forms/useTalpaForm';
import { FieldPath, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ProjectIdentifiersSection from './ProjectIdentifiersSection';
import ProjectBudgetItemSection from './ProjectBudgetItemSection';
import { Button, ButtonVariant } from 'hds-react';
import { IProjectTalpaForm } from '@/interfaces/formInterfaces';
import ProjectScheduleSection from './ProjectScheduleSection';
import ProjectContactsSection from './ProjectContactsSection';
import ProjectClassesSection from './ProjectClasses';

export function getFieldProps(name: FieldPath<IProjectTalpaForm>) {
  return {
    name: name,
    label: `projectTalpaForm.${name}`,
  };
}

export default function ProjectTalpaForm() {
  const { t } = useTranslation();
  const formMethods = useTalpaForm();
  const { handleSubmit } = formMethods;

  function submitForm(data: IProjectTalpaForm) {
    console.log('Submitting form data: ', data);
  }

  return (
    <FormProvider {...formMethods}>
      <form className="project-form max-w-xl" onSubmit={handleSubmit(submitForm)}>
        {/* SECTION 1 - Budget item number selection (hankkeen talousarviokohdan numero) */}
        <ProjectBudgetItemSection />

        {/* SECTION 2 - Project Identifiers (hankkeen tunnisteet) */}
        <ProjectIdentifiersSection />

        {/* SECTION 3 - Project Schedule (hankkeen aikataulu) */}
        <ProjectScheduleSection />

        {/* SECTION 4 - Project address and contacts (hankkeen osoite- ja yhteystiedot) */}
        <ProjectContactsSection />

        {/* SECTION 5 - Project Classes (hankkeen luokat) */}
        <ProjectClassesSection />

        <div className="project-form-banner">
          <div className="project-form-banner-container">
            <Button type="submit" variant={ButtonVariant.Primary}>
              {t('saveInformation')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
