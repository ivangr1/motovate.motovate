import React, { PureComponent } from 'react';
import moment from 'moment';
import { connectStyle } from '@shoutem/theme';
import { TouchableOpacity, Subtitle, Caption, View, Image } from '@shoutem/ui';
import { ext } from '../const';

const DEFAULT_IMAGE = require('../assets/images/graphicsGeneric.png');

class NewsItem extends PureComponent {
  render() {
    const {
      articleId,
      author,
      date,
      imageUrl,
      onPress,
      style,
      title,
    } = this.props;

    const momentDate = moment(date);
    const dateInfo = momentDate.isAfter(0) ? (
      <Caption>{momentDate.fromNow()}</Caption>
    ) : null;

    const image = imageUrl ? { uri: imageUrl } : DEFAULT_IMAGE;

    return (
      <TouchableOpacity onPress={() => onPress(articleId)}>
        <View
          style={style.mainContainer}
          styleName="flexible mxs-gutter-horizontal"
        >
          <View styleName="flexible solid horizontal rounded">
            <View styleName="solid rounded flexible vertical msm-gutter stretch space-between">
              <Caption numberOfLines={1}>{author}</Caption>
              <Subtitle numberOfLines={3}>{title}</Subtitle>
              {dateInfo}
            </View>
            <Image styleName="news-item" source={image} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const StyledNewsItem = connectStyle(ext('NewsItem'))(NewsItem);

export { StyledNewsItem as NewsItem };
