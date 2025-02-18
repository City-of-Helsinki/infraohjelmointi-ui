import { ISearchForm } from '@/interfaces/formInterfaces';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../hooks/common';
import { initialSearchForm, selectSearchForm, setSearchForm } from '@/reducers/searchSlice';
import useMultiClassOptions from '@/hooks/useMultiClassOptions';
import useMultiLocationOptions from '@/hooks/useMultiLocationOptions';
import _ from 'lodash';
import { IOption } from '@/interfaces/common';

const useSearchForm = () => {
  const dispatch = useAppDispatch();
  const storeFormValues = useAppSelector(selectSearchForm);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const formMethods = useForm<ISearchForm>({
    defaultValues: useMemo(() => storeFormValues, [storeFormValues]),
    mode: 'onBlur',
  });

  const [multiListsState, setMultiListsState] = useState({
    masterClass: [],
    class: [],
    subClass: [],
    district: [],
    division: [],
    subDivision: [],
    otherClassification: [],
  });

  const locationOptions = useMultiLocationOptions(
    multiListsState.district,
    multiListsState.division,
    multiListsState.subDivision,
  );

  const classOptions = useMultiClassOptions(
    multiListsState.masterClass,
    multiListsState.class,
    multiListsState.subClass,
    multiListsState.otherClassification,
  );

  const {
    reset,
    watch,
    getValues,
  } = formMethods;

  const setMultiListOption = useCallback((key: string, value: IOption) => {
    switch (key) {
      case 'class':
      case 'masterClass':
      case 'subClass':
      case 'district':
      case 'division':
      case 'subDivision':
      case 'otherClassification':
        setMultiListsState((current) => ({ ...current, [key]: value }));
        break;
      default:
        break;
    }
  }, []);

  /**
   * Listens to form changes and checks if form has any added values and sets submitDisabled
   */
  useEffect(() => {
    const subscription = watch((form) => {
      const formHasChanged = !_.isEqual(form, initialSearchForm);
      setSubmitDisabled(!formHasChanged);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Set form values to the store when the user chnages any values on the form
  useEffect(() => {
    const subscription = watch(() => {
      dispatch(setSearchForm(getValues()))
    });
    return () => subscription.unsubscribe();
  }, [dispatch, getValues, watch])

  // Set the form and the multi-selections to match the values in redux storeFormValues
  useEffect(() => {
    Object.entries(storeFormValues).forEach(([key, value]) => {
      setMultiListOption(key, value);
    });
    reset(storeFormValues);
  }, [storeFormValues]);

  return {
    formMethods,
    submitDisabled,
    classOptions,
    locationOptions,
  };
};

export default useSearchForm;
