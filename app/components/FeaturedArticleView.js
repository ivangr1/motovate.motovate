import React from 'react';
import moment from 'moment';
import { FeaturedArticleView as ShoutemFeaturedArticle } from 'shoutem.news/components/FeaturedArticleView';
import { connectStyle } from '@shoutem/theme';
import {
  TouchableOpacity,
  Title,
  Caption,
  View,
  Tile,
  ImageBackground,
  Divider,
} from '@shoutem/ui';
import { ext } from '../const';

class FeaturedArticleView extends ShoutemFeaturedArticle {
  render() {
    const { style, title, imageUrl, date, author } = this.props;

    const momentDate = moment(date);
    const dateInfo = momentDate.isAfter(0) ? (
      <Caption styleName="md-gutter-left">{momentDate.fromNow()}</Caption>
    ) : null;

    return (
      <TouchableOpacity onPress={this.onPress}>
        <View styleName="featured" style={style.mainContainer}>
          <ImageBackground
            style={style.backgroundImage}
            styleName="placeholder"
            source={{ uri: imageUrl }}
          >
            <Tile>
              <Title>{title || ''}</Title>
              <View styleName="horizontal" virtual>
                <Caption styleName="collapsible" numberOfLines={1}>
                  {author}
                </Caption>
                {dateInfo}
              </View>
            </Tile>
          </ImageBackground>
        </View>
      </TouchableOpacity>
    );
  }
}

const StyledFeaturedArticleView = connectStyle(ext('FeaturedArticleView'))(
  FeaturedArticleView,
);

export { StyledFeaturedArticleView as FeaturedArticleView };
