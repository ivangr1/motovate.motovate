import React from 'react';
import autoBindReact from 'auto-bind/react';
import { connect } from 'react-redux';
import {
  ArticlesScreen,
  mapStateToProps,
  mapDispatchToProps,
} from 'shoutem.news/screens/ArticlesScreen';
import { connectStyle } from '@shoutem/theme';
import { DropDownMenu, Text, View } from '@shoutem/ui';
import { FeaturedArticleView } from '../components/FeaturedArticleView';
import { NewsItem } from '../components/NewsItem';
import { ext } from '../const';

export class NewsList extends ArticlesScreen {
  static propTypes = {
    ...ArticlesScreen.propTypes,
  };

  constructor(props) {
    super(props);

    autoBindReact(this);

    this.state = {
      schema: 'shoutem.news.articles',
    };
  }

  getItemProps(item) {
    return {
      key: item.id,
      articleId: item.id,
      title: item.title,
      imageUrl: item?.image?.url,
      author: item.newsAuthor,
      date: item.timeUpdated,
    };
  }

  openArticle(article) {
    const { navigateTo } = this.props;
    const nextArticle = this.getNextArticle(article);

    const route = {
      screen: ext('ArticleDetailsScreen'),
      title: article.title,
      props: {
        article,
        nextArticle,
        openArticle: this.openArticle,
      },
    };

    navigateTo(route);
  }

  getNavBarProps() {
    const { style } = this.props;

    return {
      ...super.getNavBarProps(),
      style: style.navBar,
    };
  }

  renderDropDownOption(option, titleProperty) {
    return (
      <View>
        <Text>{option[titleProperty].toUpperCase()}</Text>
      </View>
    );
  }

  renderCategoriesDropDown(styleName) {
    const { selectedCategory, categories } = this.props;

    if (categories.length <= 1 || !this.isCategoryValid(selectedCategory)) {
      return null;
    }

    return (
      <DropDownMenu
        styleName={styleName}
        options={categories}
        titleProperty="name"
        valueProperty="id"
        onOptionSelected={this.onCategorySelected}
        selectedOption={selectedCategory}
        showSelectedOption={false}
        renderOption={this.renderDropDownOption}
      />
    );
  }

  renderRow(data) {
    return (
      <NewsItem {...this.getItemProps(data)} onPress={this.openArticleWithId} />
    );
  }

  renderFeaturedItem(item) {
    return item ? (
      <FeaturedArticleView
        {...this.getItemProps(item)}
        onPress={this.openArticleWithId}
      />
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(connectStyle(ext('NewsList'))(NewsList));
