import { useForm } from 'react-hook-form';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { listItemToOption, personToOption } from '@/utils/common';

function useConstructionHandoverFormValues(project: IProject | null): IConstructionHandoverForm {
  const defaultValues: IConstructionHandoverForm = {
    name: project?.name || '',
    description: project?.description || '',
    constructionProcurementMethod: listItemToOption(project?.constructionProcurementMethod),
    constructionStart: project?.estConstructionStart || null,
    constructionEnd: project?.estConstructionEnd || null,
    otherTimelineNotes: '',
    personPlanning: personToOption(project?.personPlanning),
    personFinancing: personToOption(project?.personProgramming),
  };

  return defaultValues;
}

export default function useConstructionHandoverForm(project: IProject | null) {
  const formValues = useConstructionHandoverFormValues(project);

  const formMethods = useForm<IConstructionHandoverForm>({
    values: formValues,
  });

  return formMethods;
}
