import React from 'react';
import { KyteAlert } from '../../../common';
import I18n from '../../../../i18n/i18n';

const Strings = {
  TITLE: I18n.t('customerAccount.customerPositiveBalanceAlertTitle'),
  TEXT: I18n.t('customerAccount.customerPositiveBalanceAlertText'),
};

const CustomerPositiveBalanceAlert = (props) => {
  return (
    <KyteAlert
      title={Strings.TITLE}
      contentText={Strings.TEXT}
      hideModal={() => props.hideModal()}
      dontCloseOnBackdropClick
    />
  );
};

export default CustomerPositiveBalanceAlert;
