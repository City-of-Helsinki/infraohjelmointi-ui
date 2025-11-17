import { useForm } from 'react-hook-form';
import { IProjectTalpaForm } from '@/interfaces/formInterfaces';
import { BudgetItemNumber } from '@/components/Project/ProjectTalpa/budgetItemNumber';
import { useAppSelector } from '@/hooks/common';
import { selectProject } from '@/reducers/projectSlice';
import { createDateToEndOfYear, createDateToStartOfYear } from '@/utils/dates';

export default function useTalpaForm() {
  const project = useAppSelector(selectProject);

  const formMethods = useForm<IProjectTalpaForm>({
    defaultValues: {
      budgetItemNumber: BudgetItemNumber.InfraInvestment,
      budgetItemName: '',
      projectStart: createDateToStartOfYear(project?.planningStartYear),
      projectEnd: createDateToEndOfYear(project?.constructionEndYear),
    },
  });

  return formMethods;
}
