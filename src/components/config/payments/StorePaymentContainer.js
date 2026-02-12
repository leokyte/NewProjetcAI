import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getLocales } from 'react-native-localize';

import { ListOptions, DetailPage } from '../../common';
import I18n from '../../../i18n/i18n';
import { logEvent } from '../../../integrations';

const StorePaymentContainer = (props) => {

  useEffect(() => {
    logEvent('Card Reader Options View')
  }, [])

  const renderMenu = () => {
    const { navigate } = props.navigation;
    const { accessToken } = props.sumUp;
    const allGateways = props.allGateways || [];
    const { cardReaderSumUp, cardReaderMercadoPago } = I18n.t('paymentMachines');

    const locales = getLocales();
    const isBrazil = locales[0].countryCode === 'BR';
    const isSumUpEnabled = allGateways.find(gateway => gateway.type === "sumup-card-reader")?.active
    const hideSumUp = !isBrazil || !isSumUpEnabled;

    const sumUpNavigate = () => {
      if (accessToken) {
        return navigate('StorePaymentSumUp');
      }
      navigate('StorePayment');
    };
    const pages = [
      { title: cardReaderSumUp, onPress: () => sumUpNavigate(), hideItem: hideSumUp },
      { title: cardReaderMercadoPago, onPress: () => navigate('StorePaymentMercadoPago') },
    ];

    return <ListOptions items={pages} />;
  };

  const { goBack } = props.navigation;
  return (
    <DetailPage pageTitle={I18n.t('configMenus.cardReaders')} goBack={goBack}>
      {renderMenu()}
    </DetailPage>
  );
};


const mapStateToProps = ({ externalPayments, auth }) => ({
  sumUp: externalPayments.sumUp,
  allGateways: externalPayments.allGateways,
  user: auth.user
});

export default connect(mapStateToProps)(React.memo(StorePaymentContainer));
