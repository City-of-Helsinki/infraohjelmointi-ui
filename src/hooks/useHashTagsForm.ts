import { IHashTagsForm } from '@/interfaces/formInterfaces';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

const useHashTagsValues = () => {
  const formValues = useMemo(
    () => ({
      hashTag: '',
    }),
    [],
  );
  return { formValues };
};

const useHashTagsForm = () => {
  const { formValues } = useHashTagsValues();

  const formMethods = useForm<IHashTagsForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onBlur',
  });

  return { formMethods, formValues };
};

export default useHashTagsForm;
