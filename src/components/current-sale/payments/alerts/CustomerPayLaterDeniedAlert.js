import React, { Fragment } from 'react';
import { KyteAlert, KyteText } from '../../../common';
import I18n from '../../../../i18n/i18n';

const Strings = {
  PAY_LATER_MODAL_TITLE: I18n.t('customerAccount.customerPayLaterDeniedAlertTitle'),
  PAY_LATER_MODAL_TEXT_1: I18n.t('customerAccount.customerPayLaterDeniedAlertText1'),
  PAY_LATER_MODAL_TEXT_2: I18n.t('customerAccount.customerPayLaterDeniedAlertText2'),
};

const CustomerPayLaterDeniedAlert = (props) => {
  const {
    hideModal,
    customerName,
  } = props;

  const renderText = () => (
    <Fragment>
      {Strings.PAY_LATER_MODAL_TEXT_1}
      <KyteText size={15} weight={'Semibold'}>{customerName}</KyteText>
      {Strings.PAY_LATER_MODAL_TEXT_2}
    </Fragment>
  );

  const renderContent = () => (
    <KyteText size={15} style={{ textAlign: 'center', lineHeight: 20 }}>
      {props.text || renderText()}
    </KyteText>
  );

  return (
    <KyteAlert
      title={Strings.PAY_LATER_MODAL_TITLE}
      hideModal={() => hideModal()}
      renderContent={() => renderContent()}
      action={() => hideModal()}
      dontCloseOnBackdropClick
    />
  );
}

export default CustomerPayLaterDeniedAlert;
