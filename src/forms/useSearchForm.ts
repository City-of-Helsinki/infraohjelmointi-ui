import { ISearchForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '../hooks/common';
import { initialSearchForm, selectSearchForm } from '@/reducers/searchSlice';
import useMultiClassOptions from '@/hooks/useMultiClassOptions';
import useMultiLocationOptions from '@/hooks/useMultiLocationOptions';

const useSearchForm = () => {
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
  );

  const {
    reset,
    watch,
    formState: { isDirty },
  } = formMethods;

  /**
   * Listens to form changes and checks if form has any added values and sets submitDisabled
   */
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      switch (name) {
        case 'class':
        case 'masterClass':
        case 'subClass':
        case 'district':
        case 'division':
        case 'subDivision':
          setMultiListsState((current) => ({ ...current, [name]: value[name] }));
          break;
        default:
          break;
      }
      if (!isDirty) {
        setSubmitDisabled(JSON.stringify(value) === JSON.stringify(initialSearchForm));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
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
