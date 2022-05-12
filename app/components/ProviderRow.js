import React, { PureComponent } from 'react';
import autoBindReact from 'auto-bind/react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { navigateTo } from 'shoutem.navigation';
import { connectStyle } from '@shoutem/theme';
import { TouchableOpacity, Text, Icon, Image, View } from '@shoutem/ui';
import { ext } from '../const';

const DEFAULT_IMAGE = require('../assets/images/graphicsLocation.png');

export class ProviderRow extends PureComponent {
  static propTypes = {
    provider: PropTypes.object.isRequired,
    showSmsButton: PropTypes.bool.isRequired,
    smsButtonLabel: PropTypes.string.isRequired,
    smsBody: PropTypes.string.isRequired,
    navigateTo: PropTypes.func,
  };

  constructor(props) {
    super(props);

    autoBindReact(this);
  }

  onPress() {
    const {
      navigateTo,
      provider,
      showSmsButton,
      smsButtonLabel,
      smsBody,
    } = this.props;

    const route = {
      screen: ext('ProviderDetails'),
      props: {
        place: provider,
        showSmsButton,
        smsButtonLabel,
        smsBody,
      },
    };

    navigateTo(route);
  }

  render() {
    const { provider, style } = this.props;
    const { location = {} } = provider;
    const { formattedAddress = '' } = location;
    const imageSource = !_.isEmpty(provider.gallery)
      ? { uri: _.head(provider.gallery) }
      : DEFAULT_IMAGE;

    return (
      <TouchableOpacity onPress={this.onPress} activeOpacity={1}>
        <View style={style.mainContainer} styleName="horizontal v-center">
          <Image style={style.providerImage} source={imageSource} />
          <View styleName="10-gutter-horizontal flexible">
            <Text numberOfLines={1} style={style.providerName}>
              {provider.name}
            </Text>
            <View styleName="horizontal v-center mxs-gutter-top">
              <Icon
                name="pin"
                fill={style.locationIconFill}
                height={style.locationIcon.height}
                width={style.locationIcon.width}
              />
              <Text numberOfLines={1} style={style.providerAddress}>
                {formattedAddress}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const mapDispatchToProps = {
  navigateTo,
};

export default connect(
  undefined,
  mapDispatchToProps,
)(connectStyle(ext('ProviderRow'))(ProviderRow));
