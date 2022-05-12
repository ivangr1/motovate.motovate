import PropTypes from 'prop-types';
import React from 'react';
import { LayoutAnimation } from 'react-native';
import _ from 'lodash';

import { MapView } from 'shoutem.application';
import PlacesMap from 'shoutem.places/components/MapList';

import { connectStyle } from '@shoutem/theme';
import { View, Spinner } from '@shoutem/ui';

import ProviderRow from '../components/ProviderRow';
import {
  createMarker,
  createMarkersFromPlaces,
  findSelectedPlace,
} from '../services/markers';
import { ext } from '../const';
import { EmptyState } from './EmptyState';

export class PlacesMapList extends PlacesMap.BaseComponent {

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
    const { selectedMarker } = this.state;

    const returnedPlace = findSelectedPlace(places, selectedMarker);

    return (
      <View styleName="maprow">
        <ProviderRow provider={returnedPlace} />
      </View>
    );
  }

  refreshMarkers(places) {
    const { selectedMarker } = this.state;
    const markers = createMarkersFromPlaces(places);

    if (selectedMarker) {
      const markedPlace = findSelectedPlace(places, selectedMarker);

      if (!markedPlace) {
        this.setState({ selectedMarker: undefined });
      }
    }

    LayoutAnimation.easeInEaseOut();
    this.setState({ markers, region: this.resolveInitialRegion(markers) });
  }

  renderPlaceholderView() {
    return (
      <EmptyState
        image={require('../assets/images/graphicsLocation.png')}
        title="No available providers that we can place on a map"
        description="Please use the list view to browse through this category"
      />
    );
  }

  render() {
    const { selectedMarker, markers, region } = this.state;
    const printImageRow = (selectedMarker) ? this.renderImageRow() : null;

    if (this.props.loading) {
      return (
        <View styleName="flexible">
          <Spinner styleName="mmd-gutter-top" />
        </View>
      );
    }

    if (_.isEmpty(markers) && !_.isEmpty(this.props.places)) {
      return this.renderPlaceholderView();
    }

    return (
      <View styleName="flexible">
        <View styleName="flexible">
          <MapView
            markers={markers}
            onMarkerPressed={this.setSelectedMarker}
            initialRegion={region}
            selectedMarker={selectedMarker}
          />
        </View>
        {printImageRow}
      </View>
    );
  }
}

export default connectStyle(ext('PlacesMapList'))(PlacesMapList);

PlacesMapList.propTypes = {
  places: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  selectedPlace: PropTypes.object,
  initialRegion: PropTypes.object,
};

PlacesMapList.defaultProps = {
  loading: false,
  selectedPlace: undefined,
  initialRegion: undefined,
};
