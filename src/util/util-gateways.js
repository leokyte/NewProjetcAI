import { Alert, Linking } from 'react-native';
import { PaymentGatewayServiceType, PaymentGatewayType, toList } from '../enums';
import I18n from '../i18n/i18n';
import { kyteAccountGatewaysUrl } from '../services';
import { logEvent } from '../integrations';
// Utilizando as propriedades do enum para o allGateways
const gatewaysList = toList(PaymentGatewayType);

// Passa a propriedade active para as cardReaders
export const gatewayFromCardReader = (cardReader) => {
  const gateway = gatewaysList.find(g => g.type === cardReader.key);

  return { active: Boolean(cardReader[cardReader.active]), ...gateway };
};

// Passa a propriedade active para os checkoutGateways
export const gatewayFromCheckout = (checkoutGateway) => {
  const gateway = gatewaysList.find(g => g.type === checkoutGateway.key);
  const hasActiveServices = checkoutGateway.services.find(s => s.active);

  return { active: Boolean(hasActiveServices), ...gateway };
};

export const cardGateways = (cardReaders) => cardReaders.map(cardReader => gatewayFromCardReader(cardReader));
export const checkoutGateways = (gateways) => gateways.map(gateway => gatewayFromCheckout(gateway));
export const CATALOG_SERVICE_TYPE = PaymentGatewayServiceType.items[PaymentGatewayServiceType.CATALOG].type

export const updateGatewaySettings = (storeConfig, storeAccountSave, updatePaymentGateways, noLoading = false) => {
  storeAccountSave({ ...storeConfig, noLoading }, updatePaymentGateways)
}

export const updateServiceStatus = (
  serviceType,
  status,
  gatewayKey,
  hasService,
  store,
  hasOtherPaymentsActive,
  selectOneAlert,
  storeAccountSave,
  updatePaymentGateways
) => {
  const editCheckoutGateways = store.checkoutGateways.map((c) => {
    if (c.key === gatewayKey) {
      return {
        ...c,
        services: hasService
          ? c.services.map((s) => (s.type === serviceType ? { ...s, active: status } : s))
          : [...c.services, { type: serviceType, active: status }],
      }
    }
    return c
  })

  if (!hasOtherPaymentsActive) {
    return selectOneAlert && selectOneAlert(I18n.t('catalogConfig.noPaymentsAlert'))
  }

  return updateGatewaySettings(
    { ...store, checkoutGateways: editCheckoutGateways },
    storeAccountSave,
    updatePaymentGateways
  )
}

export const toggleGateway = ({
  gatewayKey,
  store,
  hasOtherPaymentsActive,
  selectOneAlert,
  storeAccountSave,
  updatePaymentGateways,
  serviceType = CATALOG_SERVICE_TYPE
}) => {
  const checkoutGateways = store.checkoutGateways || []
  const hasGateway = checkoutGateways.find((c) => c.key === gatewayKey)
  const hasService =
    !!hasGateway && hasGateway.services.length > 0
      ? hasGateway.services.find((s) => s.type === serviceType)
      : null

  if (!!hasGateway && hasGateway.active && !!hasService && hasService.active) {
    logEvent('Payment Integration Disable', { 
      gateway: gatewayKey, 
      where: serviceType === CATALOG_SERVICE_TYPE ? 'online payment' : 'payment link'
    })
    return Alert.alert(
      I18n.t('words.s.attention'),
      I18n.t('integratedPayments.deactivateOnlinePayments'),
      [
        { text: I18n.t('alertDismiss') },
        {
          text: I18n.t('alertConfirm'),
          onPress: () => {
            logEvent('Payment Integration Disable Click', { 
              gateway: gatewayKey, 
              where: serviceType === CATALOG_SERVICE_TYPE ? 'online payment' : 'payment link'
            })
            updateServiceStatus(
              serviceType,         
              false,               
              gatewayKey,         
              hasService,          
              store,               
              hasOtherPaymentsActive,
              selectOneAlert,     
              storeAccountSave,    
              updatePaymentGateways
            )
          },
        },
      ]
    )
  }

  if (!!hasGateway && hasGateway.active) {
    logEvent('Payment Integration Enable', { 
      gateway: gatewayKey, 
      where: serviceType === CATALOG_SERVICE_TYPE ? 'online payment' : 'payment link'
    })
    return updateServiceStatus(
      serviceType,
      true,
      gatewayKey,
      hasService,
      store,
      hasOtherPaymentsActive,
      selectOneAlert,
      storeAccountSave,
      updatePaymentGateways
    )
  }

  Linking.openURL(kyteAccountGatewaysUrl(gatewayKey, store.aid))
}

