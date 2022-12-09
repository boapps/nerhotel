import React from 'react';
import { SmartLink } from './SmartLink';
import { useTranslation } from 'react-i18next';
import Leaflet from 'leaflet';
import {Map, TileLayer} from 'react-leaflet';
import {HotelContext} from '../context';
import {getMarkerList} from '../leaflet-helper.js';

import Icon from './Icon.js';

import styles from '../css/hotel.module.css';
import arrowIcon from '../assets/arrow-icon.svg';
import hotelIcon from '../assets/hotel-icon.svg';
import horseIcon from '../assets/horse-icon.svg';

import { config } from '../config';

/**
 * @param {Hotel[]} hotels
 * @param {string} personName
 * @returns {Hotel[]}
 */
function _getAllHotelsAffiliatedWithPerson(hotels, personName) {
  return hotels.filter(
    hotel => hotel.properties.ceos.find(ceo => ceo.name === personName)
      || hotel.properties.oligarchs.find(oligarch => oligarch.name === personName));
}

const Person = (props) => {
  const personName = props.name;
  const { t } = useTranslation();

  const hotelContext = React.useContext(HotelContext);
  /** @type {Hotel[]} */
  const hotels = hotelContext.hotels;
  const affiliatedHotels = _getAllHotelsAffiliatedWithPerson(hotels, personName);

  /** @type {{name: string, link: string}|undefined} */
  const person = affiliatedHotels
    ? (affiliatedHotels[0].properties.ceos.find(ceo => ceo.name === personName)
    || affiliatedHotels[0].properties.oligarchs.find(oligarch => oligarch.name === personName)) : undefined;
  const isMainOligarch = !!(affiliatedHotels
    && (affiliatedHotels[0].properties.mainCEO.find(ceo => ceo.name === personName)
      || affiliatedHotels[0].properties.mainOligarch.find(oligarch => oligarch.name === personName)));
  /** @type {string} */
  const personUrl = (affiliatedHotels.length && person) ? person.link : '';

  const bounds = affiliatedHotels.length ? new Leaflet.LatLngBounds(affiliatedHotels.map(hotel => ([hotel.geometry.coordinates[0], hotel.geometry.coordinates[1]]))) : undefined;

  return (
    <div className={[styles.hotel, 'hotel'].join(' ')}>
      <div className={styles.hotelWrapper}>
        <div className={styles.info}>
          <h1>
            {isMainOligarch && <SmartLink to="/about"><Icon img={horseIcon} size="large" className={styles.inlineIcon}/></SmartLink>}{personName}
          </h1>
          {personUrl && <p>{t('person:dbLink')}: <SmartLink to={personUrl}>{personName}</SmartLink></p>}
          {(affiliatedHotels.length > 0) && (
            <>
              <div className={styles.hotelRow}>
                <Icon img={hotelIcon} size="small"/>
                <p>{t('person:relatedPlaces')}:</p>
              </div>
              <div className={styles.hotelRow}>
                <ul>
                  {affiliatedHotels.map((hotel, key) => (
                    <li key={key} className={styles.oligarch}>
                        <SmartLink to={`/hotel/${hotel.properties.id}`}>
                          {hotel.properties.name}
                        </SmartLink>
                      <span className={styles.title}> ({hotel.properties.type})</span>{hotel.properties.address && ` – ${hotel.properties.address}`}{hotel.properties.date && (<> – {hotel.properties.date}</>)}
                      {hotel.properties.details && (
                        <p><span>{t('general:additionalInfo')}:</span> {hotel.properties.details}</p>)}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          <SmartLink to="/" className={styles.back}>
            <Icon img={arrowIcon} alt={t('backToMap')} size="large"/>
          </SmartLink>
        </div>
        <div className={styles.map}>
          <Map className="markercluster-map" bounds={bounds} maxZoom={config.map.maxZoom}>
            <TileLayer
              url={config.map.url}
              attribution={config.map.attribution}
            />
            {getMarkerList({points: affiliatedHotels})}
          </Map>
        </div>
      </div>
    </div>
  );
};

export default Person;
