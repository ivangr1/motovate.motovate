import PropTypes from 'prop-types';
import React from 'react';
import { LayoutAnimation, FlatList } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import { bindActionCreators } from 'redux';

import { MapView } from 'shoutem.application';
import { navigateTo } from 'shoutem.navigation';
import PlacesMap from 'shoutem.places/components/MapList';

import { View, Spinner } from '@shoutem/ui';
import { connectStyle } from '@shoutem/theme';

import {
  createMarker,
  createMarkersFromPlaces,
  findSelectedPlace,
  findSelectedPlaces,
} from '../../services/markers';
import { ext } from '../../const';
import { EmptyState } from '../EmptyState';
import VacancyRow from './VacancyRow';


export class VacanciesMapList extends PlacesMap.BaseComponent {
  constructor(props) {
    super(props);
    const { selectedPlace } = this.props;

    this.renderImageRow = this.renderImageRow.bind(this);
    this.renderPlaceholderView = this.renderPlaceholderView.bind(this);
    this.openGroupsScreen = this.openGroupsScreen.bind(this);
    this.refreshMarkers = this.refreshMarkers.bind(this);
    this.state = {
      ...this.state,
      selectedMarker: createMarker(selectedPlace),
    };
  }

  renderImageRow() {
    const { places } = this.props;
    const { selectedMarker } = this.state;

    const returnedPlaces = findSelectedPlaces(places, selectedMarker);

    return (
      <View styleName="maprow">
        <FlatList
          data={returnedPlaces}
          horizontal
          snapToInterval={340}
          renderItem={({ item }) => <View style={{ width: 340, marginRight: 16 }}><VacancyRow vacancy={item} onPress={this.props.onPress} /></View>}
          keyExtractor={item => item.id}
        />
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

  openGroupsScreen() {
    this.props.navigateTo({
      screen: 'motovate.notification-center.PushGroupsScreen',
    });
  }

  renderPlaceholderView() {
    return (
      <EmptyState
        image={require('../../assets/images/graphicsVacancy.png')}
        title="No available vacancies that we can place on a map"
        description="If you’d like to be informed when new positions open up, subscribe to our “Vacancies” push group"
        action={this.openGroupsScreen}
        actionTitle="Notification Settings"
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

export const mapDispatchToProps = (dispatch) => (
  bindActionCreators(
    {
      navigateTo,
    },
    dispatch,
  )
);

export default connect(undefined, mapDispatchToProps)(
  connectStyle(ext('VacanciesMapList'))(VacanciesMapList)
);

VacanciesMapList.propTypes = {
  places: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  selectedPlace: PropTypes.object,
  initialRegion: PropTypes.object,
  onPress: PropTypes.func.isRequired,
};

VacanciesMapList.defaultProps = {
  loading: false,
  selectedPlace: undefined,
  initialRegion: undefined,
};
