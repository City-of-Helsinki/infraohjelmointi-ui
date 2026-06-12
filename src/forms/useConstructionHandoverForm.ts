import { useForm } from 'react-hook-form';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import {
  ConstructionHandoverStatus,
  IConstructionHandover,
  IConstructionHandoverFinancing,
} from '@/interfaces/constructionHandoverInterfaces';
import { listItemToOption, personToOption } from '@/utils/common';
import { formatDateToHds } from '@/utils/dates';

const getBudgetItemLabel = (budgetItem: IConstructionHandoverFinancing['budgetItem']): string => {
  if (!budgetItem) return '';
  if (typeof budgetItem === 'string') return budgetItem;
  return (
    budgetItem.id ??
    budgetItem.value ??
    budgetItem.siteName ??
    budgetItem.site ??
    budgetItem.name ??
    ''
  );
};

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
    constructionHandoverFinancing: (constructionHandover.constructionHandoverFinancing ?? []).map(
      (item) => ({
        description: item.description ?? '',
        budget: item.budget !== null && item.budget !== undefined ? `${item.budget}` : '',
        projectNumber: item.projectNumber ?? '',
        budgetItem: getBudgetItemLabel(item.budgetItem),
        id: item.id,
        financer: item.financingParty ?? '',
      }),
    ),
    totalCost: constructionHandover.totalCost ? `${constructionHandover.totalCost}` : '',
  };
}

export default function useConstructionHandoverForm(constructionHandover: IConstructionHandover) {
  const formValues = useConstructionHandoverFormValues(constructionHandover);

  const formMethods = useForm<IConstructionHandoverForm>({
    values: formValues,
    disabled: constructionHandover.status !== ConstructionHandoverStatus.DRAFT,
  });

  return formMethods;
}
