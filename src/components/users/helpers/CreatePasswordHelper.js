import React from 'react';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';

import I18n from '../../../i18n/i18n';
import { KyteIcon } from '../../common';
import { colors, Type, colorSet } from '../../../styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

const CreatePasswordHelper = (props) => {
  const { mainContainer, iconContainer, passwordLabel, helpTextContainer, helpTextLabel } = styles;
  return (
    <TouchableOpacity style={mainContainer} onPress={props.onPress} activeOpacity={0.8}>
      <View style={iconContainer}>
        <KyteIcon
          name={'dotted-arrow-right'}
          color={colors.secondaryBg}
          size={100}
          style={{ paddingRight: 10, paddingTop: 3 }}
        />
        <Text style={passwordLabel}>{I18n.t('userHelperPasswordLabel')}</Text>
      </View>

      <View style={helpTextContainer}>
        <Text style={helpTextLabel}>
          {I18n.t('userHelperPasswordMsg')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  mainContainer: {
    backgroundColor: 'rgba(255,255,255, 0.9)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    alignItems: 'flex-end',
  },
  passwordLabel: [
    Type.SemiBold,
    Type.fontSize(13),
    colorSet(colors.actionColor), { paddingRight: 18 },
  ],
  iconContainer: {
    position: 'relative',
    flexDirection: 'row',
    right: 0,
    top: SMALL_SCREENS ? 70 : 80,
    left: 0,
  },
  iconsContainer: {
    position: 'relative',
    flexDirection: 'row',
    right: 0,
  },
  helpTextContainer: {
    position: 'relative',
    paddingTop: 85,
  },
  helpTextLabel: [
    Type.Regular,
    Type.fontSize(16),
    colorSet(colors.secondaryBg),
    { textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
  ],
};

export default CreatePasswordHelper;
