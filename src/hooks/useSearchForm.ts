import { FormField, HookFormControlType, IForm, ISearchForm } from '@/interfaces/formInterfaces';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useAppDispatch, useAppSelector } from './common';
import _ from 'lodash';
import {
  initialState,
  selectFreeSearchParams,
  selectOpen,
  selectSearchForm,
  setSearchForm,
} from '@/reducers/searchSlice';

const buildSearchFormFields = (
  control: HookFormControlType,
  translate: TFunction<'translation', undefined>,
): Array<IForm> => {
  const formFields = [
    {
      name: 'filter',
      type: FormField.ListField,
      readOnly: true,
    },
    {
      name: 'masterClass',
      type: FormField.MultiSelect,
      placeholder: 'Valitse',
    },
    {
      name: 'class',
      type: FormField.MultiSelect,
      placeholder: 'Valitse',
    },
    {
      name: 'subClass',
      type: FormField.MultiSelect,
      placeholder: 'Valitse',
    },
    {
      name: 'programmed',
      type: FormField.FieldSet,
      fieldSet: [
        { name: 'programmedYes', type: FormField.Checkbox },
        { name: 'programmedNo', type: FormField.Checkbox },
      ],
    },
    {
      name: 'programmedYearMin',
      type: FormField.Select,
      placeholder: 'Valitse',
    },
    {
      name: 'programmedYearMax',
      type: FormField.Select,
      placeholder: 'Valitse',
    },
    {
      name: 'phase',
      type: FormField.Select,
      placeholder: 'Valitse',
    },
    {
      name: 'personPlanning',
      type: FormField.Select,
      icon: 'person',
      placeholder: 'Valitse',
    },
    { name: 'district', type: FormField.MultiSelect, placeholder: 'Valitse', icon: 'location' },
    { name: 'division', type: FormField.MultiSelect, placeholder: 'Valitse', icon: 'location' },
    { name: 'subDivision', type: FormField.MultiSelect, placeholder: 'Valitse', icon: 'location' },
    {
      name: 'category',
      type: FormField.Select,
      placeholder: 'Valitse',
    },
  ];

  const projectBasicsFormFields = formFields.map((formField) => ({
    ...formField,
    control,
    label: translate(`searchForm.${formField.name}`),
    fieldSet: formField.fieldSet?.map((fieldSetField) => ({
      ...fieldSetField,
      control,
      label: translate(`searchForm.${fieldSetField.name}`),
    })),
  }));

  return projectBasicsFormFields;
};

const useSearchForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const storeFormValues = useAppSelector(selectSearchForm, _.isEqual);
  const open = useAppSelector(selectOpen, _.isEqual);
  const freeSearchParams = useAppSelector(selectFreeSearchParams, _.isEqual);
  const formMethods = useForm<ISearchForm>({
    defaultValues: useMemo(() => storeFormValues, [storeFormValues]),
    mode: 'onBlur',
  });

  const {
    control,
    reset,
    getValues,
    setValue,
    formState: { dirtyFields },
  } = formMethods;

  const currentFormValues = getValues();

  const formHasDefaultValues =
    JSON.stringify(currentFormValues) === JSON.stringify(initialState.form);

  /**
   * hack solution to set the form dirty manually by switching a form value to dirty,
   * currently react-hook-form doesn't provide a better way
   */
  const setFormDirty = useCallback(() => {
    const programmedYesValue = getValues('programmedYes');
    setValue('programmedYes', !programmedYesValue, { shouldDirty: true });
    setValue('programmedYes', programmedYesValue);
  }, [getValues, setValue]);

  /**
   * Make the form dirty manually if freeSearchParams has values, and reset the form
   * with its current values if freeSearchParams are empty
   */
  useEffect(() => {
    if (!_.isEmpty(freeSearchParams) && _.isEmpty(dirtyFields)) {
      setFormDirty();
    } else if (_.isEmpty(freeSearchParams) && formHasDefaultValues) {
      dispatch(setSearchForm(currentFormValues));
      reset(currentFormValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeSearchParams, open]);

  /**
   * Set the form to dirty if there are no empty fields and freeSearchParams has values when opening the form
   */
  useEffect(() => {
    if (formHasDefaultValues && !_.isEmpty(freeSearchParams) && _.isEmpty(dirtyFields)) {
      setFormDirty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFormValues]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formFields = useMemo(() => buildSearchFormFields(control, t), [control]);

  return { formFields, formMethods };
};

export default useSearchForm;
