import React from 'react';
import { connectStyle } from '@shoutem/theme';
import { Image } from '@shoutem/ui';
import { ArticleDetailsScreen as ShoutemDetailsScreen } from 'shoutem.news/screens/ArticleDetailsScreen';
import { ext } from '../const';

export class ArticleDetailsScreen extends ShoutemDetailsScreen {
  static propTypes = {
    ...ShoutemDetailsScreen.propTypes,
  };

  isNavigationBarClear() {
    return true;
  }

  renderImage() {
    const { article, style } = this.props;

    if (!article.image) {
      return null;
    }

    return (
      <Image
        animationName="hero"
        source={{ uri: article.image.url }}
        style={style.headerImage}
        styleName="placeholder"
      />
    );
  }
}

export default connectStyle(ext('ArticleDetailsScreen'))(ArticleDetailsScreen);
