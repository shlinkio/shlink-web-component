import { bottle } from './container';
import { createShlinkWebComponent } from './ShlinkWebComponent';
import { fixLeafletIcons } from './utils/helpers/leaflet';
import './index.scss';

// This overwrites icons used for leaflet maps, fixing some issues caused by webpack while processing the CSS
fixLeafletIcons();

export const ShlinkWebComponent = createShlinkWebComponent(bottle);

export type ShlinkWebComponentType = typeof ShlinkWebComponent;

export type {
  RealTimeUpdatesSettings,
  ShortUrlCreationSettings,
  ShortUrlsListSettings,
  VisitsSettings,
  TagsSettings,
  Settings,
} from './utils/settings';

export type { TagColorsStorage } from './utils/services/TagColorsStorage';
