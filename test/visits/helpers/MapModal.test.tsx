import { render, screen } from '@testing-library/react';
import { MapModal } from '../../../src/visits/helpers/MapModal';
import type { CityStats } from '../../../src/visits/types';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<MapModal />', () => {
  const toggle = vi.fn();
  const zaragozaLat = 41.6563497;
  const zaragozaLong = -0.876566;
  const newYorkLat = 40.73061;
  const newYorkLong = -73.935242;
  const londonLat = 51.5072;
  const londonLong = -0.1276;
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
  const setUp = (locationsToRender = locations) =>
    render(<MapModal toggle={toggle} isOpen title="Foobar" locations={locationsToRender} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected map', () => {
    setUp();
    const dialog = screen.getByRole('dialog');

    expect(dialog).toContainElement(screen.getByRole('heading', { name: 'Foobar' }));
    expect(dialog.querySelector('.leaflet-container')).toBeInTheDocument();
    expect(dialog.querySelectorAll('.leaflet-marker-icon')).toHaveLength(locations.length);
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '54 visits from Zaragoza' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7 visits from New York' })).toBeInTheDocument();
  });

  it('renders singular accessible labels for one-visit markers', () => {
    setUp([
      {
        cityName: 'London',
        count: 1,
        latLong: [londonLat, londonLong],
      },
    ]);

    expect(screen.getByRole('button', { name: '1 visit from London' })).toBeInTheDocument();
  });
});
