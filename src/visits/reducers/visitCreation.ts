import { createAction } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useAppDispatch } from '../../store';
import type { CreateVisit } from '../types';

export const createNewVisits = createAction(
  'shlink/visitCreation/createNewVisits',
  (createdVisits: CreateVisit[]) => ({ payload: { createdVisits } }),
);

export const useVisitCreation = () => {
  const dispatch = useAppDispatch();
  const dispatchCreateNewVisits = useCallback(
    (createdVisits: CreateVisit[]) => dispatch(createNewVisits(createdVisits)),
    [dispatch],
  );

  return { createNewVisits: dispatchCreateNewVisits };
};
