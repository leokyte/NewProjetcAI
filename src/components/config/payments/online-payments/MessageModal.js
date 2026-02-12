import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../../styles';
import {
  ActionButton,
  CenterContent,
  KyteIcon,
  KyteQuickView,
  KyteText,
  TextButton,
} from '../../../common';
import { OnlineOrdersMessage } from '../../../../../assets/images';
import I18n from '../../../../i18n/i18n';
import NavigationService from '../../../../services/kyte-navigation';

const Strings = {
  ONLINE_ORDERS_TITLE: I18n.t('ordersTipTitle'),
  ONLINE_ORDERS_MESSAGE: I18n.t('integratedPayments.onlineOrdersMessageText'),
  ONLINE_ORDERS_NOT_NOW: I18n.t('expressions.notNow'),
  ONLINE_ORDERS_CONFIG_BTN: I18n.t('catalogBarOnlineOrderTipBtn'),
};

const MessageModal = (props) => {
  const outerContainer = { position: 'relative', backgroundColor: '#FFF', height: '100%' };
  const closeIconContainer = { position: 'absolute', right: 15, top: 10, zIndex: 100 };
  const closeIcon = {
    backgroundColor: colors.littleDarkGray,
    width: 30,
    height: 30,
    borderRadius: 15,
  };
  const container = { paddingHorizontal: 40, paddingTop: 30 };
  const bottomContainer = { paddingHorizontal: 5, paddingBottom: 15 };
  return (
    <KyteQuickView
      hideQuickView={props.hideModal}
      iconList={[{ onPressClose: props.hideModal }]}
      disabledComponents={['bottom-container', 'top-button']}
      isQuickViewVisible={props.isModalVisible}
      maxHeight="100%"
    >
      <View style={outerContainer}>
        <TouchableOpacity style={closeIconContainer} onPress={props.hideModal}>
          <CenterContent style={closeIcon}>
            <KyteIcon name={'close-navigation'} size={12} />
          </CenterContent>
        </TouchableOpacity>

        <CenterContent style={{ paddingTop: 30 }}>
          <Image
            resizeMode={'contain'}
            style={{ width: 190, height: 193 }}
            source={{ uri: OnlineOrdersMessage }}
          />
        </CenterContent>

        <CenterContent style={container}>
          <KyteText weight="Medium" size={17} pallete="secondaryBg">
            {Strings.ONLINE_ORDERS_TITLE}
          </KyteText>
          <KyteText
            size={14}
            pallete="secondaryBg"
            textAlign="center"
            style={{ paddingVertical: 20 }}
          >
            {Strings.ONLINE_ORDERS_MESSAGE}
          </KyteText>
          <TextButton weight="Medium" color={colors.actionColor} onPress={props.hideModal}>
            {Strings.ONLINE_ORDERS_NOT_NOW}
          </TextButton>
        </CenterContent>

        <View style={bottomContainer}>
          <ActionButton
            onPress={() => {
              props.hideModal();
              NavigationService.navigate('Config', 'OnlinePaymentsConfigOrder');
            }}
            nextArrow
            style={{ marginTop: 10 }}>
            {Strings.ONLINE_ORDERS_CONFIG_BTN}
          </ActionButton>
        </View>
      </View>
    </KyteQuickView>
  );
};

export default React.memo(MessageModal);
