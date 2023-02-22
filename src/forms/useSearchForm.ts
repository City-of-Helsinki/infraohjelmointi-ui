import { ISearchForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '../hooks/common';
import { initialSearchState, selectSearchForm } from '@/reducers/searchSlice';
import useMultiClassList from '@/hooks/useMultiClassList';
import useMultiLocationList from '@/hooks/useMultiLocationList';
import _ from 'lodash';

const useSearchForm = () => {
  const storeFormValues = useAppSelector(selectSearchForm);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const formMethods = useForm<ISearchForm>({
    defaultValues: useMemo(() => storeFormValues, [storeFormValues]),
    mode: 'onBlur',
  });

  const [formState, setFormState] = useState({
    masterClass: [],
    classes: [],
    subClass: [],
    district: [],
    division: [],
    subDivision: [],
  });

  const { masterClass, classes, subClass, district, division, subDivision } = formState;

  useMultiLocationList(district, division, subDivision);
  useMultiClassList(masterClass, classes, subClass);

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
      const subscription = watch((value, { name }) => {
        switch (name) {
          case 'classes':
          case 'masterClass':
          case 'subClass':
          case 'district':
          case 'division':
          case 'subDivision':
            setFormState((current) => ({ ...current, [name]: value[name] }));
            break;
          default:
            break;
        }
        setSubmitDisabled(JSON.stringify(value) === JSON.stringify(initialSearchState.form));
      });
      return () => subscription.unsubscribe();
    }
  }, [watch]);

  useEffect(() => {
    reset(storeFormValues);
  }, [storeFormValues]);

  return { formMethods, submitDisabled };
};

export default useSearchForm;
