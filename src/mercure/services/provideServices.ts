import type Bottle from 'bottlejs';
import { mercureInfoReducerCreator } from '../reducers/mercureInfo';

export const provideServices = (bottle: Bottle) => {
  // Reducer
  bottle.serviceFactory('mercureInfoReducerCreator', mercureInfoReducerCreator, 'apiClientFactory');
  bottle.serviceFactory('mercureInfoReducer', (obj) => obj.reducer, 'mercureInfoReducerCreator');

  // Actions
  bottle.serviceFactory('loadMercureInfo', (obj) => obj.loadMercureInfo, 'mercureInfoReducerCreator');
};
