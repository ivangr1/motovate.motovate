import PropTypes from 'prop-types';
import React from 'react';

import { connectStyle } from '@shoutem/theme';
import { View } from '@shoutem/ui';

import {
  createMarker,
  findSelectedPlace,
} from '../../services/markers';
import { ext } from '../../const';
import { PlacesMapList } from '../PlacesMapList';
import EventRow from './EventRow';

export class EventsMapList extends PlacesMapList {
  static propTypes = {
    places: PropTypes.array.isRequired,
    selectedPlace: PropTypes.object,
    initialRegion: PropTypes.object,
  }

  constructor(props) {
    super(props);
    const { selectedPlace } = this.props;

    this.renderImageRow = this.renderImageRow.bind(this);
    this.state = {
      ...this.state,
      selectedMarker: createMarker(selectedPlace),
    };
  }

  renderImageRow() {
    const { places } = this.props;

    const returnedPlace = findSelectedPlace(places);

    return (
      <View styleName="maprow">
        <EventRow event={returnedPlace} />
      </View>
    );
  }
}

export default connectStyle(ext('EventsMapList'))(EventsMapList);
