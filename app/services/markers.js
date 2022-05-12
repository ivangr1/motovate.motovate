import _ from 'lodash';

export function createMarker(place) {
  if (!place) {
    return undefined;
  }

  const { location = {} } = place;
  const { latitude, longitude } = location;

  if (!latitude && !longitude) {
    return undefined;
  }

  return {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    placeId: place.id,
  };
}

export function createMarkersFromPlaces(places) {
  return _.reduce(places, (result, place) => {
    const marker = createMarker(place);

    if (marker) {
      result.push(marker);
    }
    return result;
  },
    []);
}

export function findSelectedPlace(places, marker) {
  const selectedPlace = _.find(places, { id: marker.placeId });

  return selectedPlace;
}

export function findSelectedPlaces(places, marker) {
  const selectedPlaces = _.filter(places, (place) => place.location?.latitude == marker.latitude && place.location?.longitude == marker.longitude);

  return selectedPlaces;
}
