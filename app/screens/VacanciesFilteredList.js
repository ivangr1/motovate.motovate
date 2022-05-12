import PropTypes from 'prop-types';
import React from 'react';
import { InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import { CmsListScreen, currentLocation } from 'shoutem.cms';
import { NavigationBar, navigateTo } from 'shoutem.navigation';

import { connectStyle } from '@shoutem/theme';
import {
  View,
  ListView,
  Button,
  Screen,
  Text,
} from '@shoutem/ui';
import {
  find,
  isBusy,
  shouldRefresh,
  getCollection,
  isInitialized,
} from '@shoutem/redux-io';

import VacanciesMapList from '../components/vacancies/VacanciesMapList';
import VacancyRow from '../components/vacancies/VacancyRow';
import { ext } from '../const';
import { BaseVacanciesList } from './VacanciesList';

class VacanciesFilteredList extends BaseVacanciesList {
  static propTypes = {
    ..._.omit(BaseVacanciesList.propTypes, ['categories']),
    providerId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this.openVacancy = this.openVacancy.bind(this);

    this.state = {
      ...this.state,
      schema: ext('vacancies'),
      renderCategoriesInline: true,
      mapView: false,
    };
  }

  componentWillMount() {
    this.checkPermissionStatus();
    this.fetchData();
  }

  componentWillReceiveProps(nextProps) {
    const hasLocationChanged = !_.isEqual(this.props.currentLocation, nextProps.currentLocation);

    if (!nextProps.currentLocation && nextProps.permissionStatus.permission !== 'denied') return;

    if ((hasLocationChanged || shouldRefresh(nextProps.data)) && nextProps.currentLocation !== undefined) {
      this.fetchData(nextProps);
      return;
    }
  }

  fetchData(props = this.props) {
    const { schema } = this.state;
    const { providerId } = props;

    InteractionManager.runAfterInteractions(() =>
      this.props.find(schema, `provider-${providerId}`, {
        query: { ...this.getQueryParams(props) },
      }),
    );
  }

  getQueryParams(props) {
    const { providerId, currentLocation } = props;
    const latitude = _.get(currentLocation, 'coords.latitude');
    const longitude = _.get(currentLocation, 'coords.longitude');
    const filter = { 'filter[provider.id]': providerId };
    const expirationParams = {
      'filter[startDate][lt]': (new Date()).toISOString(),
      'filter[endDate][gt]': (new Date()).toISOString(),
    };

    const isCurrentLocationAvailable = !!latitude && !!longitude;
    if (!isCurrentLocationAvailable) {
      return {
        sort: 'name',
        ...filter,
        ...expirationParams,
      };
    }

    return { sort: 'location', latitude, longitude, ...expirationParams, ...filter };
  }

  renderRightNavBarComponent() {
    const { mapView } = this.state;
    const actionText = mapView ? 'List' : 'Map';

    return (
      <View virtual styleName="container md-gutter-right">
        <Button
          styleName="tight"
          onPress={this.toggleMapView}
        >
          <Text styleName="navBarText">{actionText}</Text>
        </Button>
      </View>
    );
  }

  shouldRenderPlaceholderView() {
    const { data } = this.props;

    return !this.isCollectionValid(data);
  }

  openVacancy(vacancy) {
    const { navigateTo } = this.props;
    const nextVacancy = this.getNextVacancy(vacancy);

    const route = {
      screen: ext('VacancyDetails'),
      title: vacancy.name,
      props: {
        event: vacancy,
        nextVacancy,
        openVacancy: this.openVacancy,
      },
    };

    navigateTo(route);
  }

  getNextVacancy(article) {
    const { data } = this.props;
    const currentArticleIndex = _.findIndex(data, { id: article.id });
    return data[currentArticleIndex + 1];
  }

  renderRow(vacancy) {
    return (
      <View styleName="mxxs-gutter-top mxs-gutter-horizontal background">
        <VacancyRow vacancy={vacancy} onPress={this.openVacancy} />
      </View>
    );
  }

  renderData(data) {
    const { mapView } = this.state;
    const loading = isBusy(data) || !isInitialized(data);

    if (this.shouldRenderPlaceholderView()) {
      return this.renderPlaceholderView();
    }

    if (mapView) {
      return <VacanciesMapList places={data} onPress={this.openVacancy} />;
    }

    return (
      <ListView
        data={data}
        loading={loading}
        renderRow={this.renderRow}
        onRefresh={this.refreshData}
        onLoadMore={this.loadMore}
        getSectionId={this.getSectionId}
        renderSectionHeader={this.renderSectionHeader}
        initialListSize={1}
      />
    );
  }

  render() {
    const { data } = this.props;

    return (
      <Screen>
        <NavigationBar {...this.getNavBarProps()} />
        {this.renderData(data)}
      </Screen>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const collection = state[ext()].filteredVacancies;
  const { providerId } = ownProps;

  return {
    data: getCollection(collection[providerId], state),
  };
};

export const mapDispatchToProps = CmsListScreen.createMapDispatchToProps({
  find,
  navigateTo,
});

const StyledVacanciesList = connect(mapStateToProps, mapDispatchToProps)(
  connectStyle(ext('VacanciesFilteredList'))(currentLocation(VacanciesFilteredList)),
);

export {
  StyledVacanciesList as VacanciesFilteredList,
};
