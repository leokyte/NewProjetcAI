import React from 'react';
import { View } from 'react-native';
import { CenterContent, KyteAlert, KyteIcon, KyteText, TextButton } from '../../../common';
import I18n from '../../../../i18n/i18n';
import { colors } from '../../../../styles';
import { generateTestID } from '../../../../util';

const Strings = {
  TITLE: I18n.t('paymentMethods.link'),
  NEED_ACTIVATION_TEXT1: I18n.t('configPaymentLinkWarning1'),
  NEED_ACTIVATION_TEXT2: I18n.t('configPaymentLinkWarning2'),
  LINK: I18n.t('paymentMethods.link'),
  NOT_NOW: I18n.t('expressions.notNow'),
  CONFIG_PAYMENT_LINK: I18n.t('configPaymentLink'),
};

const PaymentLinkNeedActivation = (props) => {
  const renderContent = () => {
    return (
      <CenterContent style={{ flex: 0 }}>
        <View style={styles.iconContainer}>
          <KyteIcon name={'link'} size={80} color={colors.primaryDarker} />
        </View>
        <KyteText weight={'Medium'} size={18} style={styles.title} {...generateTestID('pay-link-plc')}>
          {Strings.TITLE}
        </KyteText>
        <KyteText style={styles.infoText}>
          {Strings.NEED_ACTIVATION_TEXT1}
          <KyteText size={15} weight={'Semibold'}> {Strings.LINK} </KyteText>
          {Strings.NEED_ACTIVATION_TEXT2}
        </KyteText>
        <TextButton
          weight="Medium"
          title={Strings.NOT_NOW}
          color={colors.actionColor}
          style={{ paddingVertical: 0 }}
          onPress={props.hideModal}
          testProps={generateTestID('not-now-plc')}
        />
      </CenterContent>
    );
  };

  return (
    <KyteAlert
      renderContent={renderContent}
      action={props.action}
      hideModal={() => props.hideModal()}
      actionButtonText={Strings.CONFIG_PAYMENT_LINK}
      showTopCloseButton
      dontCloseOnBackdropClick
    />
  );
};

const styles = {
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 18,
    marginVertical: 20,
  },
  iconContainer: {
    paddingVertical: 25,
    backgroundColor: colors.lightBg,
    borderRadius: 80,
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 20,
  },
};

export default React.memo(PaymentLinkNeedActivation);
