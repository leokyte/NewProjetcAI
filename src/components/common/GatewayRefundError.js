import React, { PureComponent } from 'react';
import { TouchableOpacity, View, Linking } from 'react-native';
import { upperFirst } from 'lodash';
import { CenterContent, KyteIcon, KyteText, ActionButton, TextButton } from './';
import { colors } from '../../styles';
import I18n from '../../i18n/i18n';

const Strings = {
  REFUND_NOT_MADE: I18n.t('paymentMachines.integration.mercadoPago.refundNotMade'),
  REFUND_NOT_MADE_MSG: I18n.t('paymentMachines.integration.mercadoPago.refundNotMadeMsg'),
  SALE_DETAILS_BTN: I18n.t('goToSaleDetails'),
};

class GatewayRefundError extends PureComponent {
  render() {
    const { content: sale, onPress, onPressClose } = this.props;
    const outerContainer = { position: 'relative', backgroundColor: '#FFF' };
    const closeIconContainer = { position: 'absolute', right: 15, top: 10, zIndex: 100 };
    const closeIcon = {
      backgroundColor: colors.littleDarkGray,
      width: 30,
      height: 30,
      borderRadius: 15,
    };
    const errorIcon = {
      height: 120,
      width: 120,
      borderRadius: 100,
      backgroundColor: colors.barcodeRed,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 30,
    };
    const container = { paddingHorizontal: 10 };
    const textStyle = { textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 };
    const bottomContainer = { paddingHorizontal: 5, paddingBottom: 15 };
    const noteLink = { marginBottom: 10, padding: 10, alignSelf: 'center' };

    return (
      <View style={outerContainer}>
        <TouchableOpacity style={closeIconContainer} onPress={onPressClose}>
          <CenterContent style={closeIcon}>
            <KyteIcon name={'close-navigation'} size={12} />
          </CenterContent>
        </TouchableOpacity >
        <CenterContent>
          <View style={errorIcon}>
            <KyteIcon name="cross-thin" color="#FFF" size={56} />
          </View>
        </CenterContent>
        <View style={container}>
          <KyteText marginTop={30} size={20} style={textStyle} weight={'Medium'}>
            {upperFirst(I18n.t('words.s.sale'))} #{sale.number}
          </KyteText>
          <KyteText marginBottom={20} size={20} style={textStyle} weight={'Medium'}>
            {Strings.REFUND_NOT_MADE}
          </KyteText>
          <KyteText marginBottom={10} size={16} style={textStyle}>
            {Strings.REFUND_NOT_MADE_MSG}
          </KyteText>
        </View>
        <View style={bottomContainer}>
          <TextButton
            onPress={() => Linking.openURL('https://www.kyte.com.br/tutoriais/cancelamento-mercado-pago')}
            title={I18n.t('expressions.learnMore')}
            color={colors.actionColor}
            size={16}
            style={noteLink}
            weight={'Medium'}
          />
          <ActionButton onPress={onPress}>{Strings.SALE_DETAILS_BTN}</ActionButton>
        </View>
      </View>
    );
  }
}

export default GatewayRefundError;
