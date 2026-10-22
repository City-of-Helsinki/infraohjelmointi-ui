import { useEffect } from 'react';
import { FieldValues, Path, PathValue, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { useOptions } from '@/hooks/useOptions';
import { IOption } from '@/interfaces/common';

export default function useConstructionProcurementMethod<
  FormType extends FieldValues,
  ProcurementMethodField extends Path<FormType>,
  StaraReasonField extends Path<FormType>,
>(
  watch: UseFormWatch<FormType>,
  setValue: UseFormSetValue<FormType>,
  procurementMethodField: ProcurementMethodField,
  staraReasonField: StaraReasonField,
) {
  const constructionProcurementMethods = useOptions('constructionProcurementMethods');
  const staraProcurementReasons = useOptions('staraProcurementReasons');

  const constructionProcurementMethod = watch(procurementMethodField) as IOption | null;
  const showStaraProcurementReason = constructionProcurementMethod?.label === 'Stara';

  useEffect(() => {
    if (!showStaraProcurementReason) {
      setValue(staraReasonField, {
        label: '',
        value: '',
      } as PathValue<FormType, StaraReasonField>);
    }
  }, [setValue, showStaraProcurementReason, staraReasonField]);

  return {
    constructionProcurementMethods,
    staraProcurementReasons,
    showStaraProcurementReason,
  };
}
