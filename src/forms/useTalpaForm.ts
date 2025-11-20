import { useForm } from 'react-hook-form';
import { IProjectTalpaForm } from '@/interfaces/formInterfaces';
import { BudgetItemNumber } from '@/components/Project/ProjectTalpa/budgetItemNumber';
import { useAppSelector } from '@/hooks/common';
import { selectProject } from '@/reducers/projectSlice';
import { createDateToEndOfYear, createDateToStartOfYear } from '@/utils/dates';
import { selectPlanningClasses, selectPlanningSubClasses } from '@/reducers/classSlice';

export default function useTalpaForm() {
  const project = useAppSelector(selectProject);

  const classes = useAppSelector(selectPlanningClasses);
  const subClasses = useAppSelector(selectPlanningSubClasses);

  const selectedSubClass = project
    ? subClasses.find(({ id }) => id === project.projectClass)
    : undefined;

  const projectClassId = selectedSubClass?.parent ?? project?.projectClass;

  const selectedClass = projectClassId
    ? classes.find(({ id }) => id === projectClassId)
    : undefined;

  const responsiblePerson = project?.personProgramming
    ? `${project.personProgramming.firstName} ${project.personProgramming.lastName}`
    : '';

  const initialValues = {
    budgetItemNumber: BudgetItemNumber.InfraInvestment,
    budgetAccount: selectedClass ? selectedClass.name : '',
    projectStart: createDateToStartOfYear(project?.planningStartYear),
    projectEnd: createDateToEndOfYear(project?.constructionEndYear),
    responsiblePerson,
  };

  const formMethods = useForm<IProjectTalpaForm>({
    defaultValues: initialValues,
  });

  return formMethods;
}
