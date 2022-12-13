import { IError } from '@/interfaces/common';
import { getProjectCardsThunk } from '@/reducers/projectCardSlice';
import { RootState } from '@/store';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from './common';
import _ from 'lodash';

const useProjectCardsList = () => {
  const projectCardsFromRedux = useAppSelector(
    (state: RootState) => state.projectCard.projectCards,
    _.isEqual,
  );
  const projectCardsCount = useAppSelector(
    (state: RootState) => state.projectCard.count,
    _.isEqual,
  );
  const error = useAppSelector((state: RootState) => state.projectCard.error, _.isEqual) as IError;
  const page = useAppSelector((state: RootState) => state.projectCard.page, _.isEqual);
  const [isLastProjectsFetched, setIsLastProjectsFetched] = useState(false);
  const [isFetchingCards, setIsFetchingCards] = useState(false);
  const dispatch = useAppDispatch();

  const fetchNext = () => {
    if (!isLastProjectsFetched && !isFetchingCards && !error?.message) {
      setIsFetchingCards(true);
      dispatch(getProjectCardsThunk(page + 1)).finally(() => setIsFetchingCards(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const projectCards = useMemo(() => projectCardsFromRedux, [projectCardsFromRedux]);

  // set isAllProjectsFetched preventing any further fetches
  useEffect(() => {
    setIsLastProjectsFetched(
      projectCardsCount !== null && projectCards.length >= projectCardsCount,
    );
  }, [projectCards, projectCardsCount]);

  return { projectCards, fetchNext };
};

export default useProjectCardsList;
