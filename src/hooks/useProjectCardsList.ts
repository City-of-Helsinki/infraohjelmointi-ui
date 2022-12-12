import { IError } from '@/interfaces/common';
import { getProjectCardsThunk } from '@/reducers/projectCardSlice';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './common';

const useProjectCardsList = () => {
  const projectCards = useAppSelector((state: RootState) => state.projectCard.projectCards);
  const projectCardsCount = useAppSelector((state: RootState) => state.projectCard.count);
  const error = useAppSelector((state: RootState) => state.projectCard.error) as IError;
  const page = useAppSelector((state: RootState) => state.projectCard.page);
  const [isLastProjectsFetched, setIsLastProjectsFetched] = useState(false);
  const [isFetchingCards, setIsFetchingCards] = useState(false);
  const dispatch = useAppDispatch();

  const fetchNext = () => {
    if (!isLastProjectsFetched && !isFetchingCards && !error?.message) {
      setIsFetchingCards(true);
      dispatch(getProjectCardsThunk(page + 1)).finally(() => setIsFetchingCards(false));
    }
  };

  // set isAllProjectsFetched preventing any further fetches
  useEffect(() => {
    setIsLastProjectsFetched(
      projectCardsCount !== null && projectCards.length >= projectCardsCount,
    );
  }, [projectCards, projectCardsCount]);

  return { projectCards, fetchNext };
};

export default useProjectCardsList;
