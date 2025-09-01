import { useEffect } from 'react';
import { IOption } from '@/interfaces/common';
import { useAppDispatch, useAppSelector } from './common';
import {
  fetchProgrammers,
  selectProgrammers,
  selectProgrammersStatus,
} from '@/reducers/programmerSlice';

export const useProgrammerOptions = () => {
  const dispatch = useAppDispatch();
  const programmers = useAppSelector(selectProgrammers);
  const status = useAppSelector(selectProgrammersStatus);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProgrammers());
    }
  }, [dispatch, status]);

  const options: IOption[] = programmers.map((programmer) => ({
    value: programmer.id,
    label: `${programmer.firstName} ${programmer.lastName}`.trim(),
  }));

  // Add empty option at the start
  options.unshift({ value: '', label: '' });

  return options;
};
