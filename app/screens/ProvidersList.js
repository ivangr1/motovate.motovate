import React from 'react';
import autoBindReact from 'auto-bind/react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { LayoutAnimation } from 'react-native';
import { CmsListScreen, currentLocation } from 'shoutem.cms';
import { NavigationBar, navigateTo } from 'shoutem.navigation';
import { PlacesList } from 'shoutem.places/screens/PlacesList';
import { find, isBusy, isInitialized, shouldRefresh } from '@shoutem/redux-io';
import { connectStyle } from '@shoutem/theme';
import {
  DropDownMenu,
  View,
  Text,
  Screen,
  ListView,
  Button,
} from '@shoutem/ui';
import { EmptyState } from '../components/EmptyState';
import PlacesMapList from '../components/PlacesMapList';
import ProviderRow from '../components/ProviderRow';
import { ext } from '../const';

const graphicsLocationImage = require('../assets/images/graphicsLocation.png');

class ProvidersList extends PlacesList {
  static propTypes = {
    ...PlacesList.propTypes,
  };

  constructor(props) {
    super(props);

    autoBindReact(this);

    this.state = {
      schema: ext('providers'),
      renderCategoriesInline: true,
      mapView: false,
    };
  }

  componentWillMount() {
    this.checkPermissionStatus();
    this.refreshInvalidContent(this.props, true);
  }

  componentWillReceiveProps(nextProps) {
    this.refreshInvalidContent(nextProps);
  }

  refreshInvalidContent(nextProps, initialization = false) {
    const { categories, data, selectedCategory } = nextProps;

    if (isBusy(categories)) {
      // Do not do anything related to categories until they are loaded.
      return;
    }

    if (
      this.props.parentCategoryId &&
      shouldRefresh(categories, initialization)
    ) {
      // Expired case.
      this.fetchCategories();
      return;
    }

    if (!_.size(categories)) {
      // Without categories data can not be fetched.
      // Unsupported case, CMS list screen requires categories to work.
      return;
    }

    // Categories are required to resolve
    // either selectedCategory or data for selected category.
    if (
      !this.isCategoryValid(selectedCategory) ||
      (categories !== this.props.categories &&
        !this.isSelectedCategoryValid(nextProps))
    ) {
      this.onCategorySelected(categories[0]);
    }

    const nextCategory = nextProps.selectedCategory;

    const shouldRefreshData =
      this.isCategoryValid(nextCategory) && shouldRefresh(data);
    const hasOrderingChanged =
      this.props.sortField !== nextProps.sortField ||
      this.props.sortOrder !== nextProps.sortOrder;
    const hasLocationChanged = !_.isEqual(
      this.props.currentLocation,
      nextProps.currentLocation,
    );

    if (shouldRefreshData || hasOrderingChanged || hasLocationChanged) {
      this.fetchData(this.getFetchDataOptions(nextProps));
    }
  }

  fetchData(options) {
    LayoutAnimation.easeInEaseOut();
    return super.fetchData(options);
  }

  toggleMapView() {
    const { mapView } = this.state;

    LayoutAnimation.easeInEaseOut();
    this.setState({ mapView: !mapView });
  }

  renderPlaceholderView() {
    return (
      <EmptyState
        image={graphicsLocationImage}
        title="No available providers"
        description="There are no providers to display at the moment"
      />
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

  getNavBarProps() {
    return {
      ...super.getNavBarProps(),
      renderRightComponent: () => this.renderRightNavBarComponent(),
    };
  }

  renderDropDownOption(option, titleProperty) {
    return (
      <View>
        <Text>{option[titleProperty].toUpperCase()}</Text>
      </View>
    );
  }

  renderCategoriesDropDown() {
    const { categories, selectedCategory } = this.props;

    if (categories.length <= 1 || !this.isCategoryValid(selectedCategory)) {
      return null;
    }

    return (
      <DropDownMenu
        styleName="horizontal"
        options={categories}
        titleProperty="name"
        valueProperty="id"
        visibleOptions={12}
        onOptionSelected={this.onCategorySelected}
        selectedOption={selectedCategory}
        renderOption={this.renderDropDownOption}
      />
    );
  }

  renderRow(provider) {
    const { showSmsButton, smsButtonLabel, smsBody } = _.get(
      this.props,
      'shortcut.settings',
    );

    return (
      <ProviderRow
        provider={provider}
        showSmsButton={showSmsButton}
        smsButtonLabel={smsButtonLabel}
        smsBody={smsBody}
      />
    );
  }

  renderData(data) {
    const { style } = this.props;
    const { mapView } = this.state;
    const loading = isBusy(data) || !isInitialized(data);

    if (this.shouldRenderPlaceholderView()) {
      return this.renderPlaceholderView();
    }

    if (mapView) {
      return <PlacesMapList places={data} loading={loading} />;
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
        style={style.list}
      />
    );
  }

  render() {
    const { data } = this.props;
    const { renderCategoriesInline } = this.state;

    return (
      <Screen styleName="paper">
        <NavigationBar {...this.getNavBarProps()} />
        {renderCategoriesInline && this.renderCategoriesDropDown()}
        {this.renderData(data)}
      </Screen>
    );
  }
}

export const mapStateToProps = CmsListScreen.createMapStateToProps(
  state => state[ext()].providers,
);

export const mapDispatchToProps = CmsListScreen.createMapDispatchToProps({
  find,
  navigateTo,
});

const StyledProvidersList = connect(
  mapStateToProps,
  mapDispatchToProps,
)(connectStyle(ext('ProvidersList'))(currentLocation(ProvidersList)));

export { StyledProvidersList as ProvidersList };
