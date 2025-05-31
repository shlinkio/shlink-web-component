import { faMapMarkedAlt as mapIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useToggle } from '@shlinkio/shlink-frontend-kit';
import { LinkButton } from '@shlinkio/shlink-frontend-kit/tailwind';
import { useCallback, useState } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import type { CityStats } from '../types';
import { MapModal } from './MapModal';

interface OpenMapModalBtnProps {
  modalTitle: string;
  activeCities?: string[];
  locations?: CityStats[];
}

export const OpenMapModalBtn = ({ modalTitle, activeCities, locations = [] }: OpenMapModalBtnProps) => {
  const { flag: mapIsOpened, setToTrue: openMap, setToFalse: closeMap } = useToggle(false, true);
  const { flag: dropdownIsOpened, toggle: toggleDropdown } = useToggle(false, true);
  const [locationsToShow, setLocationsToShow] = useState<CityStats[]>([]);

  const openMapWithCities = useCallback((filterCallback?: (city: CityStats) => boolean) => {
    setLocationsToShow(!filterCallback ? locations : locations.filter(filterCallback));
    openMap();
  }, [locations, openMap]);

  return (
    <>
      {!activeCities && (
        <LinkButton
          onClick={() => openMapWithCities()}
          aria-label="Show in map"
          title="Show in map"
        >
          <FontAwesomeIcon icon={mapIcon} />
        </LinkButton>
      )}
      {activeCities && (
        <Dropdown isOpen={dropdownIsOpened} toggle={toggleDropdown}>
          <DropdownToggle color="link" title="Show in map">
            <FontAwesomeIcon icon={mapIcon} />
          </DropdownToggle>
          <DropdownMenu end>
            {dropdownIsOpened && (
              <>
                <DropdownItem onClick={() => openMapWithCities()}>Show all locations</DropdownItem>
                <DropdownItem onClick={() => openMapWithCities(({ cityName }) => activeCities.includes(cityName))}>
                  Show locations in current page
                </DropdownItem>
              </>
            )}
          </DropdownMenu>
        </Dropdown>
      )}
      <MapModal toggle={closeMap} isOpen={mapIsOpened} title={modalTitle} locations={locationsToShow} />
    </>
  );
};
