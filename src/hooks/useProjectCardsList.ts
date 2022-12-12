import { getProjectCardsThunk } from '@/reducers/projectCardSlice';
import { RootState } from '@/store';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './common';

const useProjectCardsList = (page: number) => {
  const dispatch = useAppDispatch();
  const projectCards = useAppSelector((state: RootState) => state.projectCard.projectCards);

  useEffect(() => {
    dispatch(getProjectCardsThunk(page));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return { projectCards };
};

export default useProjectCardsList;
