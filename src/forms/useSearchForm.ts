import { ISearchForm } from '@/interfaces/formInterfaces';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../hooks/common';
import _ from 'lodash';
import {
  initialState,
  selectFreeSearchParams,
  selectOpen,
  selectSearchForm,
  setSearchForm,
} from '@/reducers/searchSlice';

const useSearchForm = () => {
  const dispatch = useAppDispatch();
  const storeFormValues = useAppSelector(selectSearchForm);
  const open = useAppSelector(selectOpen);
  const freeSearchParams = useAppSelector(selectFreeSearchParams);
  const formMethods = useForm<ISearchForm>({
    defaultValues: useMemo(() => storeFormValues, [storeFormValues]),
    mode: 'onBlur',
  });

  const {
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

  return { formMethods };
};

export default useSearchForm;
