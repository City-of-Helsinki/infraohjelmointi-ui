import { IGroupForm } from '@/interfaces/formInterfaces';

import { useForm } from 'react-hook-form';

import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectMasterClasses, selectClasses, selectSubClasses } from '@/reducers/classSlice';
import { selectDistricts, selectDivisions, selectSubDivisions } from '@/reducers/locationSlice';
import useClassOptions from '@/hooks/useClassOptions';
import useLocationOptions from '@/hooks/useLocationOptions';

interface ISelectionState {
  selectedClass: string | undefined;
  selectedLocation: string | undefined;
}
const useGroupValues = () => {
  const formValues = useMemo(
    () => ({
      name: '',
      masterClass: {},
      class: {},
      subClass: {},
      district: {},
      division: {},
      subDivision: {},
      projectsForSubmit: [],
    }),
    [],
  );
  return { formValues };
};

const useGroupForm = () => {
  const [selections, setSelections] = useState<ISelectionState>({
    selectedClass: '',
    selectedLocation: '',
  });
  const { selectedClass, selectedLocation } = selections;
  const classOptions = useClassOptions(selectedClass);
  const locationOptions = useLocationOptions(selectedLocation);
  const { formValues } = useGroupValues();

  const formMethods = useForm<IGroupForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onSubmit',
  });

  const { watch, setValue } = formMethods;
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      switch (name) {
        case 'masterClass':
          if (value.masterClass?.value) {
            setSelections((current) => ({ ...current, selectedClass: value.masterClass?.value }));
            setValue('class', { label: '', value: '' });
            setValue('subClass', { label: '', value: '' });
          }
          break;
        case 'class':
          if (value.class?.value) {
            setSelections((current) => ({ ...current, selectedClass: value.class?.value }));
            setValue('subClass', { label: '', value: '' });
          }
          break;
        case 'subClass':
          if (value.subClass?.value) {
            setSelections((current) => ({ ...current, selectedClass: value.subClass?.value }));
          }
          break;
        case 'district':
          if (value.district?.value) {
            setSelections((current) => ({ ...current, selectedLocation: value.district?.value }));
            setValue('division', { label: '', value: '' });
            setValue('subDivision', { label: '', value: '' });
          }

          break;
        case 'division':
          if (value.division?.value) {
            setSelections((current) => ({ ...current, selectedLocation: value.division?.value }));
            setValue('subDivision', { label: '', value: '' });
          }

          break;
        case 'subDivision':
          if (value.subDivision?.value) {
            setSelections((current) => ({
              ...current,
              selectedLocation: value.subDivision?.value,
            }));
          }

          break;
        default:
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  return {
    formMethods,
    formValues,
    classOptions,
    locationOptions,
  };
};

export default useGroupForm;
