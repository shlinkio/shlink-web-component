import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { OverviewFactory } from '../Overview';

export function provideServices(bottle: Bottle, connect: ConnectDecorator) {
  bottle.factory('Overview', OverviewFactory);
  bottle.decorator('Overview', connect(
    ['shortUrlsList', 'tagsList', 'visitsOverview'],
    ['listShortUrls', 'createNewVisits', 'loadVisitsOverview'],
  ));
}
