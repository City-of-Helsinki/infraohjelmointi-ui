import { FormSectionTitle } from '@/components/shared';
import RadioButtonField from '@/components/shared/RadioButtonField';
import { getFieldProps } from './ProjectTalpaForm';
import { useTranslation } from 'react-i18next';
import { BudgetItemNumber } from './budgetItemNumber';
import { IProjectTalpaForm } from '@/interfaces/formInterfaces';

export default function ProjectBudgetItemSection() {
  const { t } = useTranslation();

  return (
    <div className="mb-12">
      <FormSectionTitle {...getFieldProps('budgetItemNumber')} />
      <RadioButtonField<IProjectTalpaForm>
        id="infra-investment"
        name="budgetItemNumber"
        value={BudgetItemNumber.InfraInvestment}
        label={t('projectTalpaForm.infraInvestment')}
        className="mb-4"
      />
      <RadioButtonField<IProjectTalpaForm>
        id="pre-construction"
        name="budgetItemNumber"
        value={BudgetItemNumber.PreConstruction}
        label={t('projectTalpaForm.preConstruction')}
      />
    </div>
  );
}
