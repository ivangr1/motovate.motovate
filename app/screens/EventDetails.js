import React from 'react';
import { Linking, Platform } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';

import { navigateTo as navigateToAction } from 'shoutem.navigation';
import { openURL as openUrlAction } from 'shoutem.web-view';
import { formatDate } from 'shoutem.events/shared/Calendar';
import MediumEventDetailsScreen from 'shoutem.events/screens/MediumEventDetailsScreen';

import {
  Title,
  Caption,
  SimpleHtml,
  View,
  Button,
  Text,
  Divider,
} from '@shoutem/ui';
import { connectStyle } from '@shoutem/theme';

import { ext } from '../const';

const getEventLocationCoordinate = (event, coordinate) => (
  parseFloat(_.get(event, `location.${coordinate}`))
);

const getEventLocation = event => ({
  latitude: getEventLocationCoordinate(event, 'latitude'),
  longitude: getEventLocationCoordinate(event, 'longitude'),
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
});

export class EventDetails extends MediumEventDetailsScreen.BaseComponent {
  static propTypes = {
    ...MediumEventDetailsScreen.BaseComponent.propTypes,
  };

  constructor(props, context) {
    super(props, context);
    this.openMapScreen = this.openMapScreen.bind(this);
  }

  isNavigationBarClear = () => true;

  openMapScreen() {
    const { location = {} } = this.props.event;
    const { latitude, longitude, formattedAddress } = location;

    const resolvedScheme = (Platform.OS === 'ios') ? `http://maps.apple.com/?ll=${latitude},${longitude}&q=${formattedAddress}` :
      `geo:${latitude},${longitude}?q=${formattedAddress}`;

    if (latitude && longitude) {
      Linking.openURL(resolvedScheme);
    }
  }

  renderInformation(event) {
    return event.description ? (
      <View styleName="solid">
        <Divider styleName="header">
          <Caption>INFORMATION</Caption>
        </Divider>
        <SimpleHtml body={event.description} />
      </View>
    ) : null;
  }

  renderAddToCalendarButton() {
    return (
      <View>
        <Button
          styleName="event-button"
          onPress={this.addToCalendar}
        >
          <Text>Add to calendar</Text>
        </Button>
      </View>
    );
  }

  renderHeadlineDetails(event) {
    const textColorStyle = 'bright';

    return (
      <View virtual>
        <Title styleName={`${textColorStyle} event-title mmd-gutter-bottom`}>
          {event.name}
        </Title>
        <Caption styleName={`${textColorStyle} mxs-gutter-bottom`}>
          {formatDate(event.startTime)}
        </Caption>
        <Divider styleName="line small center" />
        <Caption styleName={`${textColorStyle} mxs-gutter-top lg-gutter-bottom`}>
          {formatDate(event.endTime)}
        </Caption>
      </View>
    );
  }
}

export const mapDispatchToProps = {
  openURL: openUrlAction,
  navigateTo: navigateToAction,
};

export default connect(undefined, mapDispatchToProps)(
  connectStyle(ext('EventDetails'))(EventDetails),
);
