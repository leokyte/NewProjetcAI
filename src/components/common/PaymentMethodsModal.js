import React from 'react';
import { View } from 'react-native';

import { KyteModal, KyteText, ActionButton } from ".";
import PaymentItem from '../current-sale/payments/PaymentItem';
import I18n from '../../i18n/i18n';
import { generateTestID } from '../../util';
import { scaffolding, colors } from '../../styles';

const Strings = {
  MODAL_TITLE: I18n.t('paymentMethod'),
};

const PaymentMethodsModal = (props) => {
  // Props
  const { payments, onPress, hideModal, disabledList } = props;

  // Style
  const { bottomContainer } = scaffolding;
  const { methodsContainer, methodsContainerTitle } = styles;

  // Payment Methods
  const renderPaymentMethods = () => (
      <View>
        <View style={methodsContainerTitle}>
          <KyteText weight="Semibold" size={18}>
            {Strings.MODAL_TITLE}
          </KyteText>
        </View>
        <View style={methodsContainer}>
          {payments.map((paymentType, i) => (
            <PaymentItem
              key={i}
              description={paymentType.description}
              icon={paymentType.icon}
              doubleSized={paymentType.doubleSized}
              noFill={paymentType.noFill}
              onPress={() => onPress(paymentType)}
              disabled={disabledList?.includes(paymentType.type)}
              testProps={generateTestID(`${paymentType.description}-psm`)}
            />
          ))}
        </View>
      </View>
    );

  // Main
  return (
    <KyteModal bottomPage height="auto" isModalVisible hideModal={() => hideModal()}>
      <View>
        {renderPaymentMethods()}
        <View style={bottomContainer}>
          <ActionButton
            style={{ marginBottom: 10 }}
            cancel
            onPress={() => hideModal()}
            testProps={generateTestID('cancel-psm')}
          >
            {I18n.t('paymentSplitCancelButton')}
          </ActionButton>
        </View>
      </View>
    </KyteModal>
  );
};

const styles = {
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.borderColor,
  },
  methodsContainerTitle: {
    alignItems: 'center',
    paddingVertical: 25,
  },
};

export { PaymentMethodsModal };
