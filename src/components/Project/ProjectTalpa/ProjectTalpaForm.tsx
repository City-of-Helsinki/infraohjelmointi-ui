import useTalpaForm from '@/forms/useTalpaForm';
import { FieldPath, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ProjectIdentifiersSection from './ProjectIdentifiersSection';
import ProjectBudgetItemSection from './ProjectBudgetItemSection';
import { Button, ButtonVariant, LoadingSpinner } from 'hds-react';
import { IProjectTalpaForm } from '@/interfaces/formInterfaces';
import ProjectScheduleSection from './ProjectScheduleSection';
import ProjectContactsSection from './ProjectContactsSection';
import ProjectClassesSection from './ProjectClasses';
import moment from 'moment';
import {
  ITalpaProjectOpeningRequest,
  TalpaPriority,
  TalpaReadiness,
  TalpaSubject,
} from '@/interfaces/talpaInterfaces';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { selectProject } from '@/reducers/projectSlice';
import { patchTalpaProjectOpeningThunk, postTalpaProjectOpeningThunk } from '@/reducers/talpaSlice';
import { BudgetItemNumber } from './budgetItemNumber';
import { IOption } from '@/interfaces/common';

export function getFieldProps(name: FieldPath<IProjectTalpaForm>) {
  return {
    name: name,
    label: `projectTalpaForm.${name}`,
  };
}

const formatDate = (date?: string | null) => {
  if (!date) {
    return null;
  }

  const parsedFinnish = moment(date, 'DD.MM.YYYY', true);
  if (parsedFinnish.isValid()) {
    return parsedFinnish.format('YYYY-MM-DD');
  }

  const parsedFallback = moment(date);
  return parsedFallback.isValid() ? parsedFallback.format('YYYY-MM-DD') : null;
};

function mapTalpaFormToRequest(
  formData: IProjectTalpaForm,
  requestType: 'create' | 'update',
  projectId: string | undefined,
): ITalpaProjectOpeningRequest {
  const holdingTimeValue =
    formData.holdingTime === null || formData.holdingTime === undefined
      ? ''
      : String(formData.holdingTime);

  const templateProject =
    formData.budgetItemNumber === BudgetItemNumber.InfraInvestment
      ? (formData.templateProject as string)
      : (formData.templateProject as IOption).label;

  return {
    subject: requestType === 'create' ? TalpaSubject.Uusi : TalpaSubject.Muutos,
    budgetAccount: formData.budgetAccount ?? '',
    projectNumberRangeId: formData.projectNumberRange?.value ?? '',
    templateProject: templateProject,
    // Get project type id based on selected priority
    // as project type is selected via priority in the form
    projectTypeId: formData.priority?.value ?? '',
    priority: TalpaPriority.Normaali,
    projectName: formData.projectName ?? '',
    projectStart: formatDate(formData.projectStart),
    projectEnd: formatDate(formData.projectEnd),
    streetAddress: formData.streetAddress ?? '',
    postalCode: formData.postalCode ?? '',
    responsiblePerson: formData.responsiblePerson ?? '',
    responsiblePersonEmail: formData.responsiblePersonEmail ?? '',
    serviceClassId: formData.serviceClass?.value ?? '',
    assetClassId: formData.assetClass?.value ?? '',
    profileName: formData.profileName ?? '',
    holdingTime: holdingTimeValue,
    investmentProfile: formData.investmentProfile ?? '',
    readiness: formData.readiness as TalpaReadiness,
    project: projectId ?? '',
  };
}

export default function ProjectTalpaForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formMethods = useTalpaForm();
  const { isDirty, isSubmitting } = formMethods.formState;
  const { handleSubmit } = formMethods;
  const project = useAppSelector(selectProject);

  const saveButtonDisabled = isSubmitting;
  const saveButtonIconStart = isSubmitting ? <LoadingSpinner small /> : null;
  const saveButtonVariant = isSubmitting ? ButtonVariant.Clear : ButtonVariant.Primary;

  async function submitForm(data: IProjectTalpaForm) {
    if (isDirty) {
      const requestData = mapTalpaFormToRequest(data, data.id ? 'update' : 'create', project?.id);

      if (data.id) {
        // Update existing talpa project
        await dispatch(patchTalpaProjectOpeningThunk({ id: data.id, data: requestData }));
      } else {
        // Create new talpa project
        await dispatch(postTalpaProjectOpeningThunk({ data: requestData }));
      }
    }
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
            <Button
              type="submit"
              variant={saveButtonVariant}
              disabled={saveButtonDisabled}
              iconStart={saveButtonIconStart}
            >
              {t('saveInformation')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
