import { useForm } from 'react-hook-form';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import {
  ConstructionHandoverStatus,
  IConstructionHandover,
} from '@/interfaces/constructionHandoverInterfaces';
import { listItemToOption, personToOption } from '@/utils/common';
import { formatDateToHds } from '@/utils/dates';
import { formatBudgetEuro } from '@/utils/currencyUtils';

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
    staraProcurementReason: listItemToOption(constructionHandover?.staraProcurementReason),
    constructionStart: formatDateToHds(constructionHandover.constructionStart),
    constructionEnd: formatDateToHds(constructionHandover.constructionEnd),
    otherTimelineNotes: constructionHandover.otherTimelineNotes || '',
    personPlanning: personToOption(constructionHandover.personPlanning),
    personFinancing: personToOption(constructionHandover.personFinancing),
    constructionHandoverFinancing: (constructionHandover.constructionHandoverFinancing ?? []).map(
      (item) => ({
        description: item.description ?? '',
        budget: item.budget == null ? '' : formatBudgetEuro(String(item.budget)),
        projectNumber: item.projectNumber ?? '',
        budgetItem: item.budgetItem?.id ?? '',
        id: item.id,
        financer: item.financingParty ?? '',
      }),
    ),
    totalCost:
      constructionHandover.totalCost == null
        ? ''
        : formatBudgetEuro(String(constructionHandover.totalCost)),
  };
}

export default function useConstructionHandoverForm(constructionHandover: IConstructionHandover) {
  const formValues = useConstructionHandoverFormValues(constructionHandover);

  const formMethods = useForm<IConstructionHandoverForm>({
    values: formValues,
    mode: 'onBlur',
    disabled: constructionHandover.status !== ConstructionHandoverStatus.DRAFT,
  });

  return formMethods;
}
