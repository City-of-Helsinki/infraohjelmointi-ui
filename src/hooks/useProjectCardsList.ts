import { IError } from '@/interfaces/common';
import { getProjectCardsThunk } from '@/reducers/projectCardSlice';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './common';

const useProjectCardsList = (page: number) => {
  const dispatch = useAppDispatch();
  const [isLastProjectsFetched, setIsLastProjectsFetched] = useState(false);
  const [isFetchingCards, setIsFetchingCards] = useState(false);
  const projectCards = useAppSelector((state: RootState) => state.projectCard.projectCards);
  const projectCardsCount = useAppSelector((state: RootState) => state.projectCard.count);
  const error = useAppSelector((state: RootState) => state.projectCard.error) as IError;

  useEffect(() => {
    setIsFetchingCards(true);
  }, [page]);

  useEffect(() => {
    if (isFetchingCards && !error) {
      dispatch(getProjectCardsThunk(page)).finally(() => setIsFetchingCards(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingCards]);

  useEffect(() => {
    setIsLastProjectsFetched(projectCards.length === projectCardsCount);
  }, [projectCards, projectCardsCount]);

  return { projectCards, isLastProjectsFetched, isFetchingCards };
};

export default useProjectCardsList;
