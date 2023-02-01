import { IPhaseForm } from '@/interfaces/formInterfaces';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const usePhaseForm = (projectPhase: string) => {
  const formValues: IPhaseForm = {
    phase: projectPhase,
  };

  const formMethods = useForm<IPhaseForm>({
    defaultValues: formValues,
    mode: 'onBlur',
  });

  const { reset } = formMethods;

  // Updates
  useEffect(() => {
    projectPhase && reset(formValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectPhase]);

  return { formMethods };
};

export default usePhaseForm;
