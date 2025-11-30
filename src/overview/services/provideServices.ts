import type Bottle from 'bottlejs';
import { OverviewFactory } from '../Overview';

export function provideServices(bottle: Bottle) {
  bottle.factory('Overview', OverviewFactory);
}
