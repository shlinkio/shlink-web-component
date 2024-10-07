import { faMapMarkedAlt as mapIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useToggle } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useState } from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import type { CityStats } from '../types';
import { MapModal } from './MapModal';

interface OpenMapModalBtnProps {
  modalTitle: string;
  activeCities?: string[];
  locations?: CityStats[];
}

export const OpenMapModalBtn = ({ modalTitle, activeCities, locations = [] }: OpenMapModalBtnProps) => {
  const [mapIsOpened, , openMap, closeMap] = useToggle();
  const [dropdownIsOpened, toggleDropdown] = useToggle();
  const [locationsToShow, setLocationsToShow] = useState<CityStats[]>([]);

  const openMapWithCities = useCallback((filterCallback?: (city: CityStats) => boolean) => {
    setLocationsToShow(!filterCallback ? locations : locations.filter(filterCallback));
    openMap();
  }, [locations, openMap]);

  return (
    <>
      {!activeCities && (
        <Button
          color="link"
          className="p-0"
          onClick={() => openMapWithCities()}
          aria-label="Show in map"
          title="Show in map"
        >
          <FontAwesomeIcon icon={mapIcon} />
        </Button>
      )}
      {activeCities && (
        <Dropdown isOpen={dropdownIsOpened} toggle={toggleDropdown}>
          <DropdownToggle color="link" className="p-0" title="Show in map">
            <FontAwesomeIcon icon={mapIcon} />
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem onClick={() => openMapWithCities()}>Show all locations</DropdownItem>
            <DropdownItem onClick={() => openMapWithCities(({ cityName }) => activeCities.includes(cityName))}>
              Show locations in current page
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}
      <MapModal toggle={closeMap} isOpen={mapIsOpened} title={modalTitle} locations={locationsToShow} />
    </>
  );
};
