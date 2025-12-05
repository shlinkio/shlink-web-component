import { useTimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import Bottle from 'bottlejs';
import { jsonToCsv } from '../utils/helpers/json';
import { ColorGenerator } from '../utils/services/ColorGenerator';
import { ImageDownloader } from '../utils/services/ImageDownloader';
import { ReportExporter } from '../utils/services/ReportExporter';
import * as visitsParser from '../visits/services/VisitsParser';

export const bottle = new Bottle();

export const { container } = bottle;

bottle.constant('window', window);
bottle.constant('fetch', window.fetch.bind(window));
bottle.service('ImageDownloader', ImageDownloader, 'fetch', 'window');

bottle.service('ColorGenerator', ColorGenerator, 'TagColorsStorage');

bottle.constant('jsonToCsv', jsonToCsv);
bottle.service('ReportExporter', ReportExporter, 'window', 'jsonToCsv');

bottle.serviceFactory('useTimeoutToggle', () => useTimeoutToggle);

bottle.serviceFactory('VisitsParser', () => visitsParser);
