import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { navigateTo } from 'shoutem.navigation';

import {
  TouchableOpacity,
  Text,
  Image,
  Subtitle,
  View,
} from '@shoutem/ui';
import { connectStyle } from '@shoutem/theme';

import { ext } from '../../const';

const DEFAULT_IMAGE = require('../../assets/images/graphicsEvent.png');

export class EventRow extends PureComponent {
  static propTypes = {
    event: PropTypes.object.isRequired,
    navigateTo: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.onPress = this.onPress.bind(this);
  }

  onPress() {
    const { event } = this.props;

    const route = {
      screen: ext('EventDetails'),
      props: {
        event,
      },
    };

    this.props.navigateTo(route);
  }

  render() {
    const { event } = this.props;
    const { location = {} } = event;
    const { formattedAddress = '' } = location;
    const imageSource = event.image ? { uri: event.image.url } : DEFAULT_IMAGE;

    return (
      <TouchableOpacity onPress={this.onPress}>
          <View styleName="horizontal solid rounded flexible">
            <Image
              styleName="list-icon"
              source={imageSource}
            />
            <View styleName="vertical flexible stretch space-between msm-gutter">
              <Subtitle styleName="tooltip-title" numberOfLines={2}>{event.name}</Subtitle>
              <Text styleName="tootlip-description" numberOfLines={1}>{formattedAddress}</Text>
            </View>
          </View>
      </TouchableOpacity>
    );
  }
}

const mapDispatchToProps = {
  navigateTo,
};

export default connect(undefined, mapDispatchToProps)(
  connectStyle(ext('EventRow'))(EventRow));
