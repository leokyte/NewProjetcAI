import I18n from '../i18n/i18n';
import { MercadoPago, StripeConnect } from '../../assets/images';

const { mercadoPagoCardReader, mercadoPagoOnline, stripeConnect } = I18n.t('paymentGateways');

export const PaymentGatewayType = {
  // TYPE numbers (NOT index)
  MERCADO_PAGO_CARD_READER: 0,
  MERCADO_PAGO_ONLINE: 1,
  STRIPE_CONNECT: 2,
  items: {
      0: { type: 'mercadopago-card-reader', description: mercadoPagoCardReader, icon: 'mercadopago', logo: MercadoPago },
      1: { type: 'mercadopago-online', description: mercadoPagoOnline, icon: 'mercadopago', logo: MercadoPago, isOnline: true },
      2: { type: 'stripe-connect', description: stripeConnect, icon: 'stripeconnect', logo: StripeConnect, isOnline: true },
    },
};

export const GatewayPaymentTypeEnum = {
  MERCADO_PAGO_ONLINE: 'mercadopago-online',
  STRIPE_CONNECT:'stripe-connect',
}
