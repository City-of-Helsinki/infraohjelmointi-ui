import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { IProjectProgrammeBasicInfo } from '@/interfaces/projectProgrammeInterfaces';

export interface IProjectProgrammeForm {
  name: string;
  district: string;
}

function getDistrictValue(district: IProjectProgrammeBasicInfo['district']): string {
  if (!district) {
    return '';
  }

  if (typeof district === 'string') {
    return district;
  }

  return district.name ?? '';
}

export default function useProjectProgrammeForm(basicInfo: IProjectProgrammeBasicInfo | null) {
  const formMethods = useForm<IProjectProgrammeForm>({
    defaultValues: {
      name: '',
      district: '',
    },
    mode: 'onBlur',
  });

  const { reset } = formMethods;

  useEffect(() => {
    reset({
      name: basicInfo?.projectName ?? '',
      district: getDistrictValue(basicInfo?.district),
    });
  }, [basicInfo, reset]);

  return formMethods;
}
