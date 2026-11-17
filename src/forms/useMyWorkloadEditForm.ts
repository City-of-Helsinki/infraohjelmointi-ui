import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { IMyWorkloadEditFormValues, MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import { emptyMyWorkloadEditFormValues, mapProjectToFormValues } from '@/utils/myWorkloadFormUtils';

const useMyWorkloadEditForm = (project: MyWorkloadTableRow | null) => {
  const formMethods = useForm<IMyWorkloadEditFormValues>({
    defaultValues: emptyMyWorkloadEditFormValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    formMethods.reset(mapProjectToFormValues(project));
  }, [formMethods, project]);

  return formMethods;
};

export default useMyWorkloadEditForm;
