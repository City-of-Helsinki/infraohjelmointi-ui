import { ISearchForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '../hooks/common';
import { initialSearchState, selectSearchForm } from '@/reducers/searchSlice';

const useSearchForm = () => {
  const storeFormValues = useAppSelector(selectSearchForm);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const formMethods = useForm<ISearchForm>({
    defaultValues: useMemo(() => storeFormValues, [storeFormValues]),
    mode: 'onBlur',
  });

  const {
    reset,
    watch,
    formState: { isDirty },
  } = formMethods;
  /**
   * Listens to form changes and checks if form has any added values and sets submitDisabled
   */
  useEffect(() => {
    if (!isDirty) {
      const subscription = watch((value) =>
        setSubmitDisabled(JSON.stringify(value) === JSON.stringify(initialSearchState.form)),
      );
      return () => subscription.unsubscribe();
    }
  }, [watch]);

  useEffect(() => {
    reset(storeFormValues);
  }, [storeFormValues]);

  return { formMethods, submitDisabled };
};

export default useSearchForm;
