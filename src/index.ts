import { bottle } from './container';
import { createShlinkWebComponent } from './ShlinkWebComponent';
import { fixLeafletIcons } from './utils/helpers/leaflet';

// This overwrites icons used for leaflet maps, fixing some issues caused by webpack while processing the CSS
fixLeafletIcons();

export const ShlinkWebComponent = createShlinkWebComponent(bottle);

export type ShlinkWebComponentType = typeof ShlinkWebComponent;

export type { ShlinkWebComponentProps } from './ShlinkWebComponent';

export type { TagColorsStorage } from './utils/services/TagColorsStorage';

export { ShlinkSidebarToggleButton } from './sidebar/ShlinkSidebarToggleButton';
export type { ShlinkSidebarToggleButtonProps } from './sidebar/ShlinkSidebarToggleButton';
export { ShlinkSidebarVisibilityProvider } from './sidebar/ShlinkSidebarVisibilityProvider';
