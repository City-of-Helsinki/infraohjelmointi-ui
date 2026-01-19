import { useEffect } from 'react';
import { useAppDispatch } from './common';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import { getTalpaListsThunk } from '@/reducers/listsSlice';

const LOADING_TALPA_LISTS = 'loading-talpa-lists';

/** Load lists data (used in dropdowns) for Talpa form */
export default function useTalpaLists() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function initializeLists() {
      dispatch(setLoading({ text: 'Loading list data', id: LOADING_TALPA_LISTS }));
      try {
        await dispatch(getTalpaListsThunk());
      } catch (error) {
        console.log('Error loading lists data: ', error);
      } finally {
        dispatch(clearLoading(LOADING_TALPA_LISTS));
      }
    }
    initializeLists();
  }, [dispatch]);
}
