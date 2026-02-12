import React from 'react';
import { KyteAlert } from '../../../common';
import I18n from '../../../../i18n/i18n';

const Strings = {
  TITLE: I18n.t('integratedPayments.linkIsDeactivatedTitle'),
  TEXT: I18n.t('integratedPayments.linkIsDeactivatedText'),
};

const PaymentLinkDeactivated = (props) => {
  return (
    <KyteAlert
      title={Strings.TITLE}
      contentText={Strings.TEXT}
      hideModal={() => props.hideModal()}
      showTopCloseButton
      dontCloseOnBackdropClick
    />
  );
};

export default React.memo(PaymentLinkDeactivated);
