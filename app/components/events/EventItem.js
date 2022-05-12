import React from 'react';
import moment from 'moment';

import { BaseEventItem } from 'shoutem.events/components/BaseEventItem';

import { connectStyle } from '@shoutem/theme';
import {
  TouchableOpacity,
  Title,
  Caption,
  View,
  Text,
  Image,
} from '@shoutem/ui';

import { ext } from '../../const';

const DEFAULT_IMAGE = require('../../assets/images/graphicsEvent.png');

export class EventItem extends BaseEventItem {

  render() {
    const { event } = this.props;
    const image = event.image ? { uri: event.image.url } : DEFAULT_IMAGE;
    const day = moment(event.startTime).format('DD');
    const month = moment(event.startTime).format('MMM');

    return (
      <TouchableOpacity onPress={this.onPress}>
        <View styleName="mxs-gutter-horizontal mxs-gutter-top rounded">
          <View styleName="rounded-top">
            <Image
              styleName="events-item"
              source={image}
            />
          </View>
          <View styleName="flexible horizontal msm-gutter-horizontal solid event-details stretch space-between">
            <View styleName="vertical stretch space-between mmd-gutter-right">
              <Title styleName="event-date">{day}</Title>
              <Caption styleName="event-month">{month.toUpperCase()}</Caption>
            </View>
            <View styleName="horizontal flexible center">
              <Text styleName="event-title" numberOfLines={2}>{event.name}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

export default connectStyle(ext('EventItem'))(EventItem);
