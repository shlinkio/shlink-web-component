import { page } from 'vitest/browser';
import { MapModal } from '../../../src/visits/helpers/MapModal';
import type { CityStats } from '../../../src/visits/types';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/setUpTest';

describe('<MapModal />', () => {
  const toggle = vi.fn();
  const zaragozaLat = 41.6563497;
  const zaragozaLong = -0.876566;
  const newYorkLat = 40.73061;
  const newYorkLong = -73.935242;
  const locations: CityStats[] = [
    {
      cityName: 'Zaragoza',
      count: 54,
      latLong: [zaragozaLat, zaragozaLong],
    },
    {
      cityName: 'New York',
      count: 7,
      latLong: [newYorkLat, newYorkLong],
    },
  ];
  const setUp = () => render(<MapModal toggle={toggle} isOpen title="Foobar" locations={locations} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected map', async () => {
    // By default, tests run in a mobile resolution. The map does some weird rendering there, so let's switch to desktop
    // resolution.
    await page.viewport(1280, 720);

    const screen = await setUp();
    expect(screen.getByRole('dialog').element()).toMatchSnapshot();
  });
});
