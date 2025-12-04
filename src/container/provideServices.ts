import type Bottle from 'bottlejs';
import { MainFactory } from '../Main';

export const provideServices = (bottle: Bottle) => {
  bottle.factory('Main', MainFactory);
};
