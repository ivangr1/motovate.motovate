import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { currentLocation } from 'shoutem.cms';
import {
  mapDispatchToProps,
  mapStateToProps,
  EventsScreen,
} from 'shoutem.events/screens/EventsScreen';

import { isInitialized } from '@shoutem/redux-io';
import { connectStyle } from '@shoutem/theme';
import {
  Text,
  View,
  Button,
} from '@shoutem/ui';

import EventItem from '../components/events/EventItem';
import EventsMapList from '../components/events/EventsMapList';
import { ext } from '../const';

function hasFeaturedEvent(events) {
  return events.some(event => event.featured);
}

export class EventsList extends EventsScreen {
  static propTypes = {
    ...EventsScreen.propTypes,
  };


  constructor(props, context) {
    super(props, context);
    this.renderRow = this.renderRow.bind(this);
    this.openDetailsScreen = this.openDetailsScreen.bind(this);
    this.state = {
      ...this.state,
      schema: 'shoutem.events.events',
      renderCategoriesInline: true,
      shouldRenderMap: false,
    };
  }

  getNavBarProps(screenTitle = 'List') {
    const { data } = this.props;
    const { shouldRenderMap } = this.state;
    const newNavBarProps = super.getNavBarProps();

    newNavBarProps.renderRightComponent = () => {
      if (_.isEmpty(data) || !isInitialized(data)) {
        return null;
      }

      return (
        <View virtual styleName="container">
          <Button styleName="clear" onPress={this.toggleMapMode}>
            <Text styleName="navBarText">{shouldRenderMap ? screenTitle : 'Map'}</Text>
          </Button>
        </View>
      );
    };

    if (hasFeaturedEvent(data)) {
      newNavBarProps.styleName = `${newNavBarProps.styleName || ''} featured`;
    }

    return newNavBarProps;
  }

  renderEventsMap(data) {
    return (
      <EventsMapList
        places={data}
      />
    );
  }

  openDetailsScreen(event) {
    this.props.navigateTo({
      screen: ext('EventDetails'),
      title: event.name,
      props: {
        event,
      },
    });
  }

  renderEventListItem(event) {
    return (
      <EventItem event={event} onPress={this.openDetailsScreen} />
    );
  }

  renderRow(event) {
    return this.renderEventListItem(event);
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(
  connectStyle(ext('EventsList'))(currentLocation(EventsList)),
);
