import Bottle from 'bottlejs';
import { provideServices as provideOverviewServices } from '../overview/services/provideServices';
import { provideServices as provideShortUrlsServices } from '../short-urls/services/provideServices';
import { provideServices as provideTagsServices } from '../tags/services/provideServices';
import { provideServices as provideUtilsServices } from '../utils/services/provideServices';
import { provideServices as provideVisitsServices } from '../visits/services/provideServices';
import { provideServices as provideWebComponentServices } from './provideServices';

export const bottle = new Bottle();

export const { container } = bottle;

provideWebComponentServices(bottle);
provideShortUrlsServices(bottle);
provideTagsServices(bottle);
provideVisitsServices(bottle);
provideOverviewServices(bottle);
provideUtilsServices(bottle);
