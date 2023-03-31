import { IGroupForm } from '@/interfaces/formInterfaces';

import { useForm } from 'react-hook-form';

import { useEffect, useMemo, useState } from 'react';
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
        case 'class':
        case 'subClass':
          if(value[name]?.value) setSelections((current) => ({ ...current, selectedClass: value[name]?.value }));
          if(name==='masterClass') setValue('class', { label: '', value: '' })
          if(name==='masterClass' || name==='class') setValue('subClass', { label: '', value: '' })
          break;
        case 'district':
        case 'division':
        case 'subDivision':
          if(value[name]?.value) setSelections((current) => ({ ...current, selectedLocation: value[name]?.value }));
          if(name==='district') setValue('division', { label: '', value: '' })
          if(name==='district' || name==='division') setValue('subDivision', { label: '', value: '' })
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
