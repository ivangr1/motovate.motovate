import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  Linking,
  Platform,
} from 'react-native';
import SendSMS from 'react-native-sms';

import { InlineMap } from 'shoutem.application';
import { NavigationBar, navigateTo } from 'shoutem.navigation';
import { openURL } from 'shoutem.web-view';

import {
  ScrollView,
  TouchableOpacity,
  Icon,
  Row,
  Subtitle,
  PageIndicators,
  Caption,
  Text,
  HorizontalPager,
  View,
  Image,
  Divider,
  Tile,
  Screen,
  Title,
  Button,
  SimpleHtml,
} from '@shoutem/ui';
import { connectStyle } from '@shoutem/theme';

import { ext } from '../const';
import { getEventLocation } from './VacancyDetails';

export class ProviderDetails extends PureComponent {
  static propTypes = {
    place: PropTypes.object.isRequired,
    openURL: PropTypes.func,
    navigateTo: PropTypes.func,
    hasFavorites: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.getNavBarProps = this.getNavBarProps.bind(this);
    this.openWebLink = this.openWebLink.bind(this);
    this.openMapLink = this.openMapLink.bind(this);
    this.openEmailLink = this.openEmailLink.bind(this);
    this.openPhoneLink = this.openPhoneLink.bind(this);
    this.renderOverlay = this.renderOverlay.bind(this);
    this.openProviderVacancies = this.openProviderVacancies.bind(this);
    this.openURL = this.openURL.bind(this);
    this.createSmsTemplate = this.createSmsTemplate.bind(this);

    this.state = {
      ...this.state,
      schema: ext('providers'),
    };
  }

  getNavBarProps() {
    const { place } = this.props;

    return {
      styleName: !_.isEmpty(place.gallery) ? 'clear' : '',
      animationName: 'solidify',
      title: place.name,
    };
  }

  openURL() {
    const { place, openURL } = this.props;

    openURL(place.rsvpLink, place.name);
  }

  openWebLink() {
    const { place, openURL } = this.props;
    openURL(place.url);
  }

  openMapLink() {
    const { location = {} } = this.props.place;
    const { latitude, longitude, formattedAddress } = location;

    const resolvedScheme = (Platform.OS === 'ios') ? `http://maps.apple.com/?ll=${latitude},${longitude}&q=${formattedAddress}` :
      `geo:${latitude},${longitude}?q=${formattedAddress}`;

    if (latitude && longitude) {
      Linking.openURL(resolvedScheme);
    }
  }

  openEmailLink() {
    const { place } = this.props;
    Linking.openURL(`mailto:${place.mail}`);
  }

  openPhoneLink() {
    const { place } = this.props;
    Linking.openURL(`tel:${place.phone}`);
  }

  openProviderVacancies() {
    const { navigateTo, place } = this.props;
    navigateTo({
      screen: ext('VacanciesFilteredList'),
      props: {
        providerId: place.id,
        title: 'VACANCIES',
      },
    });
  }

  renderPage(item) {
    return (
      <Image
        styleName="gallery-image"
        source={{ uri: item }}
      />
    );
  }

  renderOverlay() {
    const { page } = this.state;
    const { place } = this.props;

    const size = _.size(place.gallery);
    if (size < 2) return null;

    return (
      <View styleName="fill-parent" pointerEvents="none">
        <PageIndicators
          styleName="overlay"
          count={size}
          activeIndex={page}
        />
      </View>
    );
  }

  renderLeadImage(place) {
    const { gallery } = place;

    if (_.isEmpty(gallery)) return null;

    return (
      <HorizontalPager
        data={gallery}
        renderPage={this.renderPage}
        renderOverlay={this.renderOverlay}
        onIndexSelected={(index) => this.setState({ page: index })}
      />
    );
  }

  renderTitleSection(place) {
    const { location = {} } = place;
    const { formattedAddress } = location;

    return (
      <View>
        <View styleName="mmd-gutter-horizontal mxl-gutter-top mmd-gutter-bottom">
          <Title styleName="msm-gutter-bottom h-center">{place.name}</Title>
          {formattedAddress ? <Caption styleName="h-center">{formattedAddress}</Caption> : null}
          <Button styleName="mlg-gutter-top" onPress={this.openProviderVacancies}>
            <Text>View all vacancies</Text>
          </Button>
        </View>
      </View>
    );
  }

  renderInlineMap(item) {
    const { location = {} } = item;
    const { latitude, longitude, formattedAddress } = location;

    if (!latitude || !longitude) {
      return null;
    }

    const marker = {
      longitude: parseFloat(longitude),
      latitude: parseFloat(latitude),
    };
    const region = {
      ...marker,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    return (
      <View styleName="solid">
        <TouchableOpacity
          onPress={this.openMapLink}
        >
          <InlineMap
            region={region}
            markers={[marker]}
            selectedMarker={marker}
            styleName="medium-tall"
          >
            <View styleName="fill-parent overlay vertical v-center h-center">
              <Subtitle numberOfLines={1} >{item.name}</Subtitle>
              <Caption numberOfLines={2} >{formattedAddress}</Caption>
            </View>
          </InlineMap>
        </TouchableOpacity>
      </View>
    );
  }

  renderDescription(place) {
    if (place.description) {
      return (
        <Tile>
          <Divider styleName="header">
            <Caption>INFO</Caption>
          </Divider>
          <SimpleHtml body={place.description} />
          <Divider styleName="line" />
        </Tile>
      );
    }
    return null;
  }

  renderDisclosureButton(title, subtitle, icon, onPressCallback) {
    if (!title) {
      return null;
    }
    return (
      <TouchableOpacity onPress={onPressCallback}>
        <Divider styleName="line" />
        <Row>
          <Icon styleName="indicator" name={icon} />
          <View styleName="vertical">
            <Subtitle>{subtitle}</Subtitle>
            <Text numberOfLines={1}>{title}</Text>
          </View>
          <Icon styleName="indicator disclosure" name="right-arrow" />
        </Row>
        <Divider styleName="line" />
      </TouchableOpacity>
    );
  }

  renderSmsButton(place, smsButtonLabel, icon) {
    const { smsBody } = this.props;
    const { location = {} } = place;
    const { formattedAddress } = location;

    return (
      <View>
        <View styleName="mmd-gutter-horizontal mxl-gutter-top mmd-gutter-bottom">
          <Title styleName="msm-gutter-bottom h-center">{place.name}</Title>
          {formattedAddress ? <Caption styleName="h-center">{formattedAddress}</Caption> : null}
          <Button styleName="mlg-gutter-top" onPress={this.createSmsTemplate}>
            <Text>{smsButtonLabel}</Text>
          </Button>
        </View>
      </View>
    );
  }

  createSmsTemplate() {
    const { smsBody, place } = this.props;

    SendSMS.send({
      body: smsBody,
      recipients: [place.phone],
      successTypes: ['sent', 'queued'],
      allowAndroidSendWithoutReadPermission: true
    }, (completed, cancelled, error) => {
      null;
    });
  }

  render() {
    const { place, showSmsButton, smsButtonLabel } = this.props;

    return (
      <Screen styleName="full-screen paper">
        <NavigationBar {...this.getNavBarProps() } />
        <ScrollView>
          {this.renderLeadImage(place)}
          {showSmsButton ? null : this.renderTitleSection(place)}
          {showSmsButton ? this.renderSmsButton(place, smsButtonLabel, 'activity') : null}
          {this.renderDescription(place)}
          {this.renderDisclosureButton(place.url, 'Visit webpage', 'web', this.openWebLink)}
          {this.renderDisclosureButton(place.mail, 'Email', 'email', this.openEmailLink)}
          {this.renderDisclosureButton(place.phone, 'Phone', 'call', this.openPhoneLink)}
          {this.renderInlineMap(place)}
        </ScrollView>
      </Screen>
    );
  }
}

export default connect(undefined, { navigateTo, openURL })(
  connectStyle(ext('PlaceDetails'))(ProviderDetails));
