import React from 'react';
import { ActionButton, KyteIcon } from "..";
import { colors } from '../../../styles';
import I18n from '../../../i18n/i18n';

const PaymentSaveButton = (props) => (
    <ActionButton
      onPress={props.onPress}
      leftIcon={!props?.hideLeftIcon && <KyteIcon name="dollar-sign" color={colors.actionColor} size={24}/>}
      cancel
      style={props.style}
    >
      {I18n.t('paymentConcludeLaterButton')}
    </ActionButton>
  );

export default React.memo(PaymentSaveButton);
