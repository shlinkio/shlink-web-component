import { useTimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import type Bottle from 'bottlejs';
import { jsonToCsv } from '../helpers/json';
import { ColorGenerator } from './ColorGenerator';
import { ImageDownloader } from './ImageDownloader';
import { ReportExporter } from './ReportExporter';

export function provideServices(bottle: Bottle) {
  bottle.constant('window', window);
  bottle.constant('fetch', window.fetch.bind(window));
  bottle.service('ImageDownloader', ImageDownloader, 'fetch', 'window');

  bottle.service('ColorGenerator', ColorGenerator, 'TagColorsStorage');

  bottle.constant('jsonToCsv', jsonToCsv);
  bottle.service('ReportExporter', ReportExporter, 'window', 'jsonToCsv');

  bottle.serviceFactory('useTimeoutToggle', () => useTimeoutToggle);
}
