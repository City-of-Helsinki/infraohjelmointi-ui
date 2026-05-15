import { useForm } from 'react-hook-form';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import { listItemToOption, personToOption } from '@/utils/common';
import { IConstructionHandover } from '@/interfaces/constructionHandoverInterfaces';
import { formatDateToHds } from '@/utils/dates';

function useConstructionHandoverFormValues(
  constructionHandover: IConstructionHandover,
): IConstructionHandoverForm {
  return {
    id: constructionHandover.id,
    name: constructionHandover.name || '',
    description: constructionHandover.description || '',
    constructionProcurementMethod: listItemToOption(
      constructionHandover?.constructionProcurementMethod,
    ),
    constructionStart: formatDateToHds(constructionHandover.constructionStart),
    constructionEnd: formatDateToHds(constructionHandover.constructionEnd),
    otherTimelineNotes: constructionHandover.otherTimelineNotes || '',
    personPlanning: personToOption(constructionHandover.personPlanning),
    personFinancing: personToOption(constructionHandover.personFinancing),
  };
}

export default function useConstructionHandoverForm(constructionHandover: IConstructionHandover) {
  const formValues = useConstructionHandoverFormValues(constructionHandover);

  const formMethods = useForm<IConstructionHandoverForm>({
    values: formValues,
  });

  return formMethods;
}
