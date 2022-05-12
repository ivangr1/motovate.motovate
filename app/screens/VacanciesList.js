import React from 'react';
import autoBindReact from 'auto-bind/react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getExtendedData,
  getUser,
  EXTENDED_PROFILE_SCHEMA,
} from 'motovate.auth';
import { currentLocation } from 'shoutem.cms';
import {
  NavigationBar,
  navigateTo,
  getScreenState,
  setScreenState,
} from 'shoutem.navigation';
import { PlacesList } from 'shoutem.places/screens/PlacesList';
import { connectStyle } from '@shoutem/theme';
import {
  View,
  ListView,
  Button,
  Screen,
  DropDownMenu,
  Text,
  ScrollView,
} from '@shoutem/ui';
import {
  find,
  clear,
  next,
  isBusy,
  isInitialized,
  shouldRefresh,
  getCollection,
} from '@shoutem/redux-io';
import { EmptyState } from '../components/EmptyState';
import VacanciesMapList from '../components/vacancies/VacanciesMapList';
import VacancyRow from '../components/vacancies/VacancyRow';
import { ext } from '../const';
import { fetchAllSpecialties } from '../redux';

const ALL_OPTION = {
  id: 'all',
  name: 'All Vacancies',
};
const graphicsVacancyImage = require('../assets/images/graphicsVacancy.png');

class VacanciesList extends PlacesList {
  static propTypes = {
    ..._.omit(PlacesList.propTypes, ['categories']),
  };

  constructor(props) {
    super(props);

    autoBindReact(this);

    this.state = {
      schema: ext('vacancies'),
      renderCategoriesInline: true,
      mapView: false,
    };
  }

  componentDidMount() {
    const {
      specialties,
      userId,
      extendedData,
    } = this.props;

    this.checkPermissionStatus();
    this.fetchExtendedData(userId);
    fetchAllSpecialties();
    this.fetchData();
  }

  checkPermissionStatus(props = this.props) {
    const { checkPermissionStatus } = props;
    const isLocationAvailable = !!props.currentLocation;

    if (!isLocationAvailable && _.isFunction(checkPermissionStatus)) {
      checkPermissionStatus();
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      currentLocation,
      initialSpecialty: prevInitialSpec,
      selectedSpecialty: oldSpecialty,
    } = this.props;
    const {
      data,
      initialSpecialty: nextInitialSpec,
      isExtendedDataLoading,
      selectedSpecialty: newSpecialty,
      specialties,
    } = nextProps;

    const secondaryResourcesAvailable =
      !isExtendedDataLoading &&
      !isBusy(specialties) &&
      isInitialized(specialties);

    if (!prevInitialSpec && nextInitialSpec) {
      this.onSpecialtyChanged(nextInitialSpec);
      return;
    }

    if (
      newSpecialty === null &&
      shouldRefresh(data) &&
      secondaryResourcesAvailable === true
    ) {
      this.onSpecialtyChanged(ALL_OPTION);
      return;
    }

    const hasLocationChanged = !_.isEqual(
      currentLocation,
      nextProps.currentLocation,
    );

    if (
      ((oldSpecialty !== newSpecialty && shouldRefresh(data)) ||
        hasLocationChanged) &&
      nextProps.currentLocation !== undefined &&
      secondaryResourcesAvailable === true
    ) {
      this.fetchData(nextProps);
    }
  }

  onSpecialtyChanged(specialty) {
    const { selectedSpecialty, setScreenState, screenId } = this.props;

    if (selectedSpecialty && selectedSpecialty.id === specialty.id) return;

    setScreenState(screenId, {
      selectedSpecialty: specialty,
    });
  }

  getTag(props) {
    const { selectedSpecialty } = props;

    return selectedSpecialty && selectedSpecialty.id !== 'all'
      ? `specialty-${selectedSpecialty.id}`
      : '';
  }

  getQueryParams(props = this.props) {
    const { currentLocation, selectedSpecialty } = props;

    const latitude = _.get(currentLocation, 'coords.latitude');
    const longitude = _.get(currentLocation, 'coords.longitude');
    const expirationParams = {
      'filter[startDate][lt]': new Date().toISOString(),
      'filter[endDate][gt]': new Date().toISOString(),
    };
    const filter =
      selectedSpecialty && selectedSpecialty.id !== 'all'
        ? { 'filter[specialty.id]': selectedSpecialty.id }
        : undefined;

    const isCurrentLocationAvailable = !!latitude && !!longitude;
    // default to sort by name when location is unavailable
    if (!isCurrentLocationAvailable) {
      return {
        sort: 'name',
        ...filter,
        ...expirationParams,
      };
    }

    return {
      sort: 'location',
      latitude,
      longitude,
      ...expirationParams,
      ...filter,
    };
  }

  fetchData(props = this.props) {
    const { find } = this.props;
    const { schema } = this.state;

    find(schema, this.getTag(props), {
      query: { ...this.getQueryParams(props) },
    });
  }

  fetchExtendedData(userId) {
    const { find } = this.props;

    return find(EXTENDED_PROFILE_SCHEMA, undefined, {
      query: { 'filter[shoutemUser.userId]': userId },
    });
  }

  refreshData() {
    this.fetchData(this.props);
  }

  openGroupsScreen() {
    const { navigateTo } = this.props;

    navigateTo({
      screen: 'motovate.notification-center.PushGroupsScreen',
    });
  }

  renderPlaceholderView() {
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 70 }}>
        <EmptyState
          image={graphicsVacancyImage}
          title="No available vacancies"
          description="If you’d like to be informed when new positions open up, subscribe to our “Vacancies” push group"
          action={this.openGroupsScreen}
          actionTitle="Notification Settings"
        />
      </ScrollView>
    );
  }

  renderRightNavBarComponent() {
    const { mapView } = this.state;
    const actionText = mapView ? 'List' : 'Map';

    return (
      <View virtual styleName="container md-gutter-right">
        <Button styleName="tight" onPress={this.toggleMapView}>
          <Text styleName="navBarText">{actionText}</Text>
        </Button>
      </View>
    );
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

  renderDropDownOption(option, titleProperty) {
    return (
      <View>
        <Text>{option[titleProperty].toUpperCase()}</Text>
      </View>
    );
  }

  renderCategoriesDropDown() {
    const { selectedSpecialty, specialties, style } = this.props;
    if (specialties.length < 1) {
      return null;
    }

    const options = [ALL_OPTION, ..._.sortBy(specialties, (item) => item.name)];
    const selectedOption = selectedSpecialty
      ? _.find(options, item => item.id === selectedSpecialty.id)
      : ALL_OPTION;

    return (
      <DropDownMenu
        styleName={'horizontal'}
        options={options}
        titleProperty={'name'}
        valueProperty={'id'}
        visibleOptions={12}
        onOptionSelected={this.onSpecialtyChanged}
        selectedOption={selectedOption}
        renderOption={this.renderDropDownOption}
      />
    );
  }

  shouldRenderPlaceholderView() {
    const { data, isExtendedDataLoading } = this.props;

    return !this.isCollectionValid(data) && !isExtendedDataLoading;
  }

  isLoading() {
    const { data, specialties } = this.props;
    const isDataBusy = isBusy(data) || !isInitialized(data);
    const areSpecialtiesBusy =
      isBusy(specialties) || !isInitialized(specialties);

    return isDataBusy || areSpecialtiesBusy;
  }

  renderRow(vacancy) {
    return <VacancyRow vacancy={vacancy} onPress={this.openVacancy} />
  }

  renderData(data) {
    const { style } = this.props;
    const { mapView } = this.state;

    if (this.shouldRenderPlaceholderView()) {
      return this.renderPlaceholderView();
    }

    if (mapView) {
      return (
        <VacanciesMapList
          places={data}
          onPress={this.openVacancy}
          loading={this.isLoading()}
        />
      );
    }

    return (
      <ListView
        data={data}
        loading={this.isLoading()}
        renderRow={this.renderRow}
        onRefresh={this.refreshData}
        onLoadMore={this.loadMore}
        getSectionId={this.getSectionId}
        renderSectionHeader={this.renderSectionHeader}
        initialListSize={1}
        style={style.list}
      />
    );
  }

  render() {
    const { data } = this.props;

    return (
      <Screen styleName="paper">
        <NavigationBar {...this.getNavBarProps()} />
        {this.renderCategoriesDropDown()}
        {this.renderData(data)}
      </Screen>
    );
  }
}

export const mapStateToProps = (state, ownProps) => {
  const specialties = getCollection(
    state['motovate.auth'].allSpecialties,
    state,
  );
  const user = getUser(state);
  const extendedData = getExtendedData(user.legacyId, state);
  const allVacanciesCollection = state[ext()].vacancies;
  const initialSpecialtyId = _.get(extendedData, [
    'relationships',
    'specialties',
    'data',
    '0',
    'id',
  ]);
  const initialSpecialty = _.find(
    specialties,
    spec => spec.id === initialSpecialtyId,
  );
  const parentCollection = state[ext()].specialtyVacancies;
  const { screenId } = ownProps;
  const selectedSpecialty =
    _.get(getScreenState(state, screenId), 'selectedSpecialty') || null;
  const dataCollection =
    selectedSpecialty && selectedSpecialty.id !== 'all'
      ? parentCollection[selectedSpecialty.id]
      : allVacanciesCollection;
  const isExtendedDataLoading = isBusy(state['motovate.auth'].allExtendedData);

  return {
    specialties,
    screenId,
    parentCollection,
    selectedSpecialty,
    userId: user.legacyId,
    isExtendedDataLoading,
    data: getCollection(dataCollection, state),
    initialSpecialty,
  };
};

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      find,
      fetchAllSpecialties,
      setScreenState,
      clear,
      navigateTo,
      next,
    },
    dispatch,
  );

const StyledVacanciesList = connect(
  mapStateToProps,
  mapDispatchToProps,
)(connectStyle(ext('VacanciesList'))(currentLocation(VacanciesList)));

export {
  StyledVacanciesList as VacanciesList,
  VacanciesList as BaseVacanciesList,
};
