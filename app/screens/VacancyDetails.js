import React from 'react';
import { Linking, Platform } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';

import { connectStyle } from '@shoutem/theme';

import { InlineMap } from 'shoutem.application';
import {
  NavigationBar,
  navigateTo as navigateToAction
} from 'shoutem.navigation';
import { openURL as openUrlAction } from 'shoutem.web-view';
import { formatDate } from 'shoutem.events/shared/Calendar';
import { NextArticle as NextVacancy } from 'shoutem.news/components/NextArticle';

import {
  Tile,
  Title,
  Caption,
  SimpleHtml,
  Image,
  View,
  Button,
  Subtitle,
  Screen,
  TouchableOpacity,
  Text,
  ScrollView,
  Divider,
} from '@shoutem/ui';
import MediumEventDetailsScreen from 'shoutem.events/screens/MediumEventDetailsScreen';

import { ext } from '../const';

export const getEventLocationCoordinate = (event, coordinate) => {
  const resolvedCoordinate = _.get(event, `location.${coordinate}`);

  if (!resolvedCoordinate) return undefined;

  return parseFloat(resolvedCoordinate);
};

export const getEventLocation = event => {
  const locationObject = event.location ? event : event.provider;

  return ({
    latitude: getEventLocationCoordinate(locationObject, 'latitude'),
    longitude: getEventLocationCoordinate(locationObject, 'longitude'),
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
    formattedAddress: _.get(locationObject, 'location.formattedAddress'),
  });
};

export class VacancyDetails extends MediumEventDetailsScreen.BaseComponent {
  static propTypes = {
    ...MediumEventDetailsScreen.BaseComponent.propTypes,
  };

  constructor(props, context) {
    super(props, context);
    this.openMapScreen = this.openMapScreen.bind(this);
    this.openApplicationForm = this.openApplicationForm.bind(this);
    this.openApplicationEmail = this.openApplicationEmail.bind(this);
    this.renderUpNext = this.renderUpNext.bind(this);
    this.renderFacilityButton = this.renderFacilityButton.bind(this);
    this.openFacilityScreen = this.openFacilityScreen.bind(this);
  }

  isNavigationBarClear() {
    return true;
  }

  openApplicationForm() {
    const { openURL, event } = this.props;

    openURL(event.url);
  }

  openApplicationEmail() {
    const { event } = this.props;

    Linking.openURL(`mailto:?to=${event.mail}`);
  }

  openFacilityScreen() {
    const { event } = this.props;

    const route = {
      screen: ext('ProviderDetails'),
      props: {
        place: event.provider,
      },
    };

    this.props.navigateTo(route);
  }


  renderMap(event) {
    const location = getEventLocation(event);
    if (!location.latitude || !location.longitude) return null;

    return (
      <TouchableOpacity onPress={this.openMapScreen}>
        <InlineMap
          region={location}
          markers={[location]}
          selectedMarker={location}
          styleName="medium-tall"
        >
          <View styleName="vertical fill-parent v-end h-center lg-gutter-bottom">
            <Subtitle>{_.get(location, 'formattedAddress')}</Subtitle>
          </View>
        </InlineMap>
      </TouchableOpacity>
    );
  }

  renderUpNext() {
    const { nextVacancy, openVacancy } = this.props;
    if (nextVacancy && openVacancy) {
      return (
        <NextVacancy
          title={nextVacancy.name}
          imageUrl={_.get(nextVacancy, 'image.url')}
          openArticle={() => openVacancy(nextVacancy)}
        />
      );
    }
    return null;
  }

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
        <SimpleHtml body={event.description} />
      </View>
    ) : null;
  }

  renderFacilityButton() {
    const { event } = this.props;

    if (!event.provider) return null;

    return (
      <View styleName="vertical">
        <Button
          styleName="facility"
          onPress={this.openFacilityScreen}
        >
          <Image
            source={require('../assets/images/icon-enter-screen.png')}
          />
          <Text>View facility details</Text>
        </Button>
      </View>
    );
  }

  renderAddToCalendarButton() {
    const { event } = this.props;
    const { url, mail } = event;

    if (!url && !mail) return null;
    const alignment = (!url || !mail) ? 'center' : 'space-between';
    const styleName = `horizontal ${alignment}`;

    return (
      <View styleName={styleName}>
        {url ? <Button
          styleName="event-button md-gutter-right"
          onPress={this.openApplicationForm}
        >
          <Text>Apply via form</Text>
        </Button> : null}
        {mail ? <Button
          styleName="event-button secondary"
          onPress={this.openApplicationEmail}
        >
          <Text>Apply via email</Text>
        </Button> : null}
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
          {`Published: ${formatDate(event.startDate)}`}
        </Caption>
        <Divider styleName="line small center" />
        <Caption styleName={`${textColorStyle} mxs-gutter-top lg-gutter-bottom`}>
          {`Ending on: ${formatDate(event.endDate)}`}
        </Caption>
      </View>
    );
  }

  renderHeader(event) {
    if (!_.has(event, 'image.url')) {
      return this.renderWithoutPhoto(event);
    }

    return (
      <View>
        <Image
          styleName="large-square placeholder"
          resizeMode="contain"
          animationName="hero"
          source={{ uri: _.get(event, 'image.url') }}
        />
        <Tile styleName="text-centric inflexible">
          {this.renderHeadlineDetails(event)}
          {this.renderAddToCalendarButton()}
        </Tile>
      </View>
    );
  }

  renderScreen() {
    const { event } = this.props;

    let styleName = '';
    let animationName = '';
    if (this.isNavigationBarClear()) {
      if (event.image) {
        // If navigation bar is clear and image exists, navigation bar should be initially clear
        // but after scrolling down navigation bar should appear (solidify animation)
        styleName = 'clear';
        animationName = 'solidify';
      } else {
        // If navigation bar is clear, but there is no image, navigation bar should be set to solid,
        // but boxing animation should be applied so title appears after scrolling down
        animationName = 'boxing';
      }
    }

    return (
      <Screen styleName="paper">
        <NavigationBar
          styleName={styleName}
          animationName={animationName}
          title={event.name}
          share={{
            link: event.url,
            title: event.name,
          }}
        />
        {this.renderData(event)}
      </Screen>
    );
  }

  renderData(event) {
    return (
      <ScrollView>
        <View>
          {this.renderHeader(event)}
          {this.renderRsvpButton(event)}
          {this.renderInformation(event)}
          {this.renderMap(event)}
          {this.renderFacilityButton()}
        </View>
        {this.renderUpNext()}
      </ScrollView>
    );
  }
}

export const mapDispatchToProps = {
  openURL: openUrlAction,
  navigateTo: navigateToAction,
};

export default connect(undefined, mapDispatchToProps)(
  connectStyle(ext('VacancyDetails'))(VacancyDetails),
);
