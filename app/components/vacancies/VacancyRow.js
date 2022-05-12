import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { navigateTo } from 'shoutem.navigation';

import {
  TouchableOpacity,
  Text,
  Image,
  Subtitle,
  View,
} from '@shoutem/ui';
import { connectStyle } from '@shoutem/theme';

import { ext } from '../../const';

const DEFAULT_IMAGE = require('../../assets/images/graphicsVacancy.png');

export class VacancyRow extends PureComponent {
  static propTypes = {
    vacancy: PropTypes.object.isRequired,
    onPress: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.onPress = this.onPress.bind(this);
  }

  onPress() {
    const { vacancy, onPress } = this.props;

    onPress(vacancy);
  }

  render() {
    const { style, vacancy } = this.props;
    const { location = {} } = vacancy;
    const { formattedAddress = '' } = location;
    const imageSource = !_.isEmpty(vacancy.image) ? { uri: vacancy.image.url } : DEFAULT_IMAGE;

    return (
      <TouchableOpacity onPress={this.onPress}>
        <View style={style.mainContainer} styleName="horizontal v-center">
          <Image style={style.vacancyImage} source={imageSource} />
          <View styleName="10-gutter-horizontal flexible">
            <Subtitle style={style.vacancyName} numberOfLines={1}>
              {vacancy.name}
            </Subtitle>
            <Text style={style.vacancyAddress} numberOfLines={1}>
              {formattedAddress}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

export default connectStyle(ext('VacancyRow'))(VacancyRow);
