import { IClass } from '@/interfaces/classInterfaces';
import { RootState } from '@/store';
import { useMemo } from 'react';
import { useAppSelector } from './common';

export interface IProjectClassOption {
  value: string;
  label: string;
  defaultProgrammer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export const useProjectClassOptions = () => {
  const projectClasses = useAppSelector(
    (state: RootState) => state.lists.projectClasses,
  ) as Array<IClass>;

  const options = useMemo(
    () =>
      projectClasses.map((c) => ({
        value: c.id,
        label: c.name,
        defaultProgrammer: c.defaultProgrammer,
      })),
    [projectClasses],
  );

  return options;
};
