import PropTypes from 'prop-types';
import React from 'react';

import ListItem from 'shoutem.navigation/components/ListItem';
import FolderBase from 'shoutem.navigation/components/FolderBase';
import { createSubNavigationScreen } from 'shoutem.navigation';

import { connectStyle } from '@shoutem/theme';
import {
  View,
  Image,
} from '@shoutem/ui';

class SubNavigationList extends FolderBase {
  static propTypes = {
    ...FolderBase.propTypes,
    listAlignment: PropTypes.string,
    topOffset: PropTypes.number,
    showText: PropTypes.bool,
    backgroundImage: PropTypes.string,
  };

  resolvePageProps() {
    const { topOffset, listAlignment } = this.getLayoutSettings();
    const { dimensions: { height } } = this.state;
    const { style } = this.props;
    return {
      style: {
        // Min height stretch page so list can be vertically aligned
        minHeight: height,
        ...style.page,
      },
      styleName: listAlignment,
    };
  }

  resolveScrollViewProps() {
    return {
      style: {
        flexGrow: 1,
      },
    };
  }

  renderContentContainer() {
    const { dimensions: { width, height } } = this.state;

    if (width === null || height === null) {
      return null;
    }

    return (
      <View styleName="flexible" style={{ alignItems: 'stretch' }}>
        {this.renderScrollView()}
      </View>
    );
  }

  renderRow(shortcut, index) {
    const { showText, showIcon, inItemAlignment } = this.getLayoutSettings();
    const { style } = this.props;
    return (
      <ListItem
        key={`item_${index}`}
        showText={showText}
        showIcon={showIcon}
        shortcut={shortcut}
        inItemAlignment={inItemAlignment}
        onPress={this.itemPressed}
        style={style}
      />
    );
  }
}

const mapPropsToStyleNames = (styleNames, props) => {
  const { inItemAlignment } = props;

  styleNames.push(`in-item-alignment-${inItemAlignment}`);

  return FolderBase.mapPropsToStyleNames(styleNames, props);
};

export const styledScreen = connectStyle(
  'shoutem.navigation.List', undefined, mapPropsToStyleNames
)(SubNavigationList);

export default createSubNavigationScreen(styledScreen);
