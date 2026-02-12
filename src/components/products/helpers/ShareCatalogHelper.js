import React from 'react';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { connect } from 'react-redux';

import I18n from '../../../i18n/i18n';
import { KyteIcon, KyteSafeAreaView } from '../../common';
import { colors, Type, colorSet } from '../../../styles';
import { isIphoneX } from '../../../util';

const ShareCatalogHelper = (props) => {
  const { mainContainer, iconTextContainer, iconsContainer, textContainer, textStyle, innerTextStyle } = styles;
  return (
    <Modal
      isVisible={!props.shareCatalogModalVisible}
      backdropColor={props.backgroundColor || '#000000'}
      backdropOpacity={0.9}
      onBackdropPress={props.hideModal}
      hideOnBack={props.hideOnBack}
      style={{ margin: 0, padding: 0 }}
      useNativeDriver
      animationIn="fadeIn"
      animationInTiming={650}
      animationOut="fadeOut"
      animationOutTiming={300}
    >
      <TouchableOpacity
        style={mainContainer}
        onPress={props.onPress}
        activeOpacity={0.8}
      >
        <KyteSafeAreaView style={iconTextContainer}>
          <View style={iconsContainer}>
            <KyteIcon
              name={'dotted-arrow-right'}
              color={colors.secondaryBg}
              size={100}
              style={{ paddingRight: 10, paddingTop: 10 }}
            />
            <KyteIcon
              name="share"
              color={colors.secondaryBg}
              size={30}
            />
          </View>

          <View style={textContainer}>
            <Text style={[textStyle, Type.Medium]}>
              {I18n.t('catalogShareCatalogInfo')}{'\n'}
              <Text style={innerTextStyle}>{I18n.t('catalogModalShareInfoTitle')}</Text>
            </Text>
          </View>
        </KyteSafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

const styles = {
  mainContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    top: 0,
    justifyContent: 'flex-start'
  },
  iconTextContainer: {
    position: 'relative',
    alignItems: 'flex-end'
  },
  iconsContainer: {
    position: 'relative',
    flexDirection: 'row',
    top: isIphoneX() ? 10 : 20,
    right: 15
  },
  textContainer: {
    position: 'relative',
    paddingTop: 30,
    paddingRight: 20
  },
  textStyle: [
    Type.Regular,
    SMALL_SCREENS ? Type.fontSize(13) : Type.fontSize(16),
    colorSet(colors.secondaryBg),
    {
      textAlign: 'right',
      paddingHorizontal: 40,
      lineHeight: 25
    }
  ],
  innerTextStyle: [
    SMALL_SCREENS ? Type.fontSize(16) : Type.fontSize(20),
    Type.SemiBold,
    { lineHeight: 20 }
  ]
};

const mapStateToProps = (state) => ({
  shareCatalogModalVisible: state.products.shareCatalogModalVisible,
});
export default connect(mapStateToProps)(ShareCatalogHelper);
