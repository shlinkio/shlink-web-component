import { createAction } from '@reduxjs/toolkit';
import type { CreateVisit } from '../types';

export const createNewVisits = createAction(
  'shlink/visitCreation/createNewVisits',
  (createdVisits: CreateVisit[]) => ({ payload: { createdVisits } }),
);
