import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { Type, colorSet, colors } from '../../../styles';
import I18n from '../../../i18n/i18n';

class DetailObservation extends Component {
  render() {
    const { inputContainer } = styles;
    const { observation } = this.props;

    return (
      <View style={inputContainer}>
        <Text style={[Type.Regular, colorSet(colors.primaryColor)]}>
          {observation || I18n.t('saleWithoutObservation')}
        </Text>
      </View>
    );
  }
}

const styles = {
  inputContainer: { padding: 15 }
};

export default DetailObservation;
