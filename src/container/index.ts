import Bottle from 'bottlejs';
import { provideServices as provideUtilsServices } from '../utils/services/provideServices';
import { provideServices as provideVisitsServices } from '../visits/services/provideServices';

export const bottle = new Bottle();

export const { container } = bottle;

provideVisitsServices(bottle);
provideUtilsServices(bottle);
