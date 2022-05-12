import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connectStyle } from '@shoutem/theme';
import { Button, View, Text, Image } from '@shoutem/ui';
import { ext } from '../const';

class EmptyState extends PureComponent {
  static propTypes = {
    action: PropTypes.func,
    title: PropTypes.string,
    actionTitle: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.any,
  };

  static defaultProps = {
    description: 'No items found for this category',
    title: 'No Results',
  };

  render() {
    const {
      action,
      actionTitle,
      description,
      image,
      style,
      title,
    } = this.props;

    return (
      <View
        style={style.mainContainer}
        styleName="vertical flexible h-center mmd-gutter-horizontal"
      >
        <Image styleName="empty-state" source={image} />
        <Text style={style.title} styleName="mlg-gutter-top h-center">
          {title}
        </Text>
        <Text style={style.description} styleName="msm-gutter-top h-center">
          {description}
        </Text>
        {(action || actionTitle) && (
          <Button
            styleName="secondary"
            style={style.actionButton}
            onPress={action}
          >
            <Text>{actionTitle}</Text>
          </Button>
        )}
      </View>
    );
  }
}

const StyledView = connectStyle(ext('EmptyState'))(EmptyState);

export { StyledView as EmptyState };
