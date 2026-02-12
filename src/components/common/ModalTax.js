import React from 'react';
import { Dimensions, ScrollView, TouchableOpacity, Text, Image, View } from 'react-native';
import { KyteModal, KyteIcon, KyteButton } from './';
import { Type, colors, scaffolding } from '../../styles';
import I18n from '../../i18n/i18n';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

const ModalTax = (props) => {
  const { hideModal, taxType } = props;
  return (
    <KyteModal
      height={SMALL_SCREENS ? '100%' : 'auto'}
      isModalVisible
      hideModal={() => hideModal()}
    >
      <ScrollView>
        <TouchableOpacity style={modalStyles.closeNavigation} onPress={() => hideModal()}>
          <KyteIcon name='close-navigation' size={8} />
        </TouchableOpacity>
        <View style={modalStyles.titleView}>
          <Text
            style={[
              Type.Medium,
              scaffolding.textAlignCenter,
              { color: colors.secondaryBg, fontSize: 20, lineHeight: 25 },
            ]}
          >
            {taxType.tipInfo.title}
          </Text>
        </View>
        <View style={modalStyles.subtitleView}>
          <Text
            style={[
              Type.Regular,
              scaffolding.textAlignCenter,
              { color: colors.secondaryBg, fontSize: 16, lineHeight: 25 },
            ]}
          >
            {taxType.tipInfo.message}
          </Text>
        </View>
        <View style={modalStyles.imageView}>
          <Image
            resizeMode={'center'}
            style={{ width: '100%', height: SMALL_SCREENS ? 280 : 320 }}
            source={{ uri: taxType.tipInfo.imageSource }}
          />
        </View>
      </ScrollView>
      <View>
        <KyteButton
          background={colors.actionColor}
          width={'100%'}
          onPress={() => hideModal()}
          style={{ paddingVertical: 10 }}
        >
          <Text style={[Type.Medium, { color: 'white', fontSize: 16 }]}>{I18n.t('alertOk')}</Text>
        </KyteButton>
      </View>
    </KyteModal>
  );
};

export { ModalTax };

const modalStyles = {
  closeNavigation: {
    backgroundColor: '#f5f5f5',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 10,
  },
  titleView: {
    paddingHorizontal: 30,
    marginTop: 25,
  },
  subtitleView: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  imageView: {
    alignItems: 'center',
    marginTop: SMALL_SCREENS ? 0 : 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
};
