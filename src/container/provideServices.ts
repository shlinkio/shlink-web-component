import type Bottle from 'bottlejs';
import { MainFactory } from '../Main';
import { setUpStore } from './store';

export const provideServices = (bottle: Bottle) => {
  bottle.factory('Main', MainFactory);
  bottle.factory('store', setUpStore);
};
