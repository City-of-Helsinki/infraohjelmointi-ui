import useTalpaForm from '@/forms/useTalpaForm';
import { FieldPath, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ProjectIdentifiersSection from './ProjectIdentifiersSection';
import ProjectBudgetItemSection from './ProjectBudgetItemSection';
import { Button, ButtonVariant, LoadingSpinner, Notification } from 'hds-react';
import { IProjectTalpaForm } from '@/interfaces/formInterfaces';
import ProjectScheduleSection from './ProjectScheduleSection';
import ProjectContactsSection from './ProjectContactsSection';
import ProjectClassesSection from './ProjectClasses';
import moment from 'moment';
import {
  ITalpaProjectOpening,
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
import { downloadExcel } from '@/services/talpaServices';
import { saveAs } from 'file-saver';

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

export function mapTalpaFormToRequest(
  formData: IProjectTalpaForm,
  requestType: 'create' | 'update',
  projectId: string | undefined,
): ITalpaProjectOpeningRequest {
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
    projectStartDate: formatDate(formData.projectStart),
    projectEndDate: formatDate(formData.projectEnd),
    streetAddress: formData.streetAddress ?? '',
    postalCode: formData.postalCode ?? '',
    responsiblePerson: formData.responsiblePerson ?? '',
    responsiblePersonEmail: formData.responsiblePersonEmail ?? '',
    serviceClassId: formData.serviceClass?.value ?? '',
    assetClassId: formData.assetClass?.value ?? '',
    profileName: formData.profileName ?? '',
    investmentProfile: formData.investmentProfile ?? '',
    readiness: formData.readiness?.value as TalpaReadiness,
    project: projectId ?? '',
  };
}

export default function ProjectTalpaForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formMethods = useTalpaForm();
  const { isSubmitting } = formMethods.formState;
  const { handleSubmit, getValues } = formMethods;
  const project = useAppSelector(selectProject);

  const talpaProjectLocked = getValues('isLocked');

  const saveButtonDisabled = isSubmitting || talpaProjectLocked;
  const saveButtonIconStart = isSubmitting ? <LoadingSpinner small /> : null;
  const saveButtonVariant = isSubmitting ? ButtonVariant.Clear : ButtonVariant.Primary;

  async function submitForm(data: IProjectTalpaForm) {
    const requestData = mapTalpaFormToRequest(data, data.id ? 'update' : 'create', project?.id);
    let result;

    if (data.id) {
      // Update existing talpa project
      result = await dispatch(patchTalpaProjectOpeningThunk({ id: data.id, data: requestData }));
    } else {
      // Create new talpa project
      result = await dispatch(postTalpaProjectOpeningThunk({ data: requestData }));
    }

    if (result.meta.requestStatus === 'rejected') {
      return;
    }

    const excelFile = await downloadExcel((result.payload as ITalpaProjectOpening).id);

    if (excelFile?.blob) {
      const fileName = excelFile.fileName;
      saveAs(excelFile.blob, fileName);
    }
  }

  return (
    <FormProvider {...formMethods}>
      <form className="project-form max-w-xl" onSubmit={handleSubmit(submitForm)}>
        {talpaProjectLocked && (
          <Notification label={t('projectTalpaForm.projectSentLabel')} className="mb-8">
            {t('projectTalpaForm.projectSentText')}
          </Notification>
        )}

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
