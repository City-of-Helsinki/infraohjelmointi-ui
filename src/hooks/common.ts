import _ from 'lodash';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

// Use throughout the app instead of plain `useDispatch` and `useSelector` for typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = (state) =>
  useSelector(state, _.isEqual);
