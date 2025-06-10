import { faMapMarkedAlt as mapIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useToggle } from '@shlinkio/shlink-frontend-kit';
import { Dropdown, LinkButton } from '@shlinkio/shlink-frontend-kit/tailwind';
import { useCallback, useState } from 'react';
import type { CityStats } from '../types';
import { MapModal } from './MapModal';

interface OpenMapModalBtnProps {
  modalTitle: string;
  activeCities?: string[];
  locations?: CityStats[];
}

export const OpenMapModalBtn = ({ modalTitle, activeCities, locations = [] }: OpenMapModalBtnProps) => {
  const { flag: mapIsOpened, setToTrue: openMap, setToFalse: closeMap } = useToggle(false, true);
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
          className="tw:[&]:p-0"
        >
          <FontAwesomeIcon icon={mapIcon} />
        </LinkButton>
      )}
      {activeCities && (
        <Dropdown
          buttonContent={<FontAwesomeIcon icon={mapIcon} title="Show in map" />}
          buttonLabel="Show in map"
          buttonVariant="link"
          buttonClassName="tw:[&]:p-0"
          menuAlignment="right"
          caretless
        >
          <Dropdown.Item onClick={() => openMapWithCities()}>Show all locations</Dropdown.Item>
          <Dropdown.Item onClick={() => openMapWithCities(({ cityName }) => activeCities.includes(cityName))}>
            Show locations in current page
          </Dropdown.Item>
        </Dropdown>
      )}
      <MapModal toggle={closeMap} isOpen={mapIsOpened} title={modalTitle} locations={locationsToShow} />
    </>
  );
};
