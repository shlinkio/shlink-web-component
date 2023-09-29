import { render, screen } from '@testing-library/react';
import { MapModal } from '../../../src/visits/helpers/MapModal';
import type { CityStats } from '../../../src/visits/types';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<MapModal />', () => {
  const toggle = vi.fn();
  const zaragozaLat = 41.6563497;
  const zaragozaLong = -0.876566;
  const newYorkLat = 40.730610;
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

  it('renders expected map', () => {
    setUp();
    expect(screen.getByRole('dialog')).toMatchSnapshot();
  });
});
