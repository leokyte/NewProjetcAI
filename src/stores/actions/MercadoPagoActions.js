import { Alert } from 'react-native';
import { MercadoPago } from '../../util';
import { MERCADOPAGO_IS_ACTIVATED, MERCADOPAGO_SET_ERROR_DISPLAYED, MERCADOPAGO_SET_PROCESSING, EXTERNAL_PAYMENTS_SET_UP } from '../actions/types';
import {
  MercadoPagoPaymentType,
  PaymentType,
  PaymentGatewayType,
} from '../../enums';
import { currentSaleAddPayment, currentSaleSplitPayment, currentSaleSetStatus } from './CurrentSaleActions';
import NavigationService from '../../services/kyte-navigation';
import I18n from '../../i18n/i18n';
import { customerAccountEditBalance } from './CustomerActions';
import { stopLoading } from './CommonActions';

export const activateMercadoPago = (isActivated) => (dispatch) => {
  dispatch({ type: MERCADOPAGO_IS_ACTIVATED, payload: isActivated });
  dispatch({ type: EXTERNAL_PAYMENTS_SET_UP });
  if (!isActivated) {
    dispatch({ type: MERCADOPAGO_SET_PROCESSING, payload: isActivated });
  }
};

export const mercadoPagoPayment = ({ amount, description, payer_email, external_reference, is_split = false, type = MercadoPagoPaymentType.SALE, customerAccountPaymentType = null, customerAccountReason = null }) => (dispatch) => {
  const mercadoPago = new MercadoPago.Builder(amount, description, payer_email, external_reference, is_split, type, customerAccountPaymentType, customerAccountReason).build();
  dispatch({ type: MERCADOPAGO_SET_ERROR_DISPLAYED, payload: false });
  mercadoPago.invokeApp();
};

export const mercadoPagoIncomingPayment = (paymentData) => (dispatch, getState) => {
  // created this new layer to process separately sale payments and customer account payments.
  // this was neccessary because we don't have much time to refactor the entire method.
  // in the future, please, refact this method.
  const { externalPayments } = getState();
  const { errorDisplayed } = externalPayments.mercadoPago;
  const { type, result_status, error_detail } = paymentData;

  if ((result_status === 'FAILED' || result_status === 'USER_CANCELLED_ERROR') && !errorDisplayed) {
    dispatch({ type: MERCADOPAGO_SET_ERROR_DISPLAYED, payload: true });
    dispatch({ type: MERCADOPAGO_SET_PROCESSING, payload: false });
    dispatch(stopLoading());
    return Alert.alert(I18n.t('words.s.attention'), MercadoPago.getReasonForRejection(error_detail));
  }

  if (parseInt(type) === MercadoPagoPaymentType.SALE) return dispatch(mercadoPagoSalePayment(paymentData));
  if (parseInt(type) === MercadoPagoPaymentType.CUSTOMER_ACCOUNT) return dispatch(mercadoPagoCustomerAccountPayment(paymentData));
};

export const mercadoPagoCustomerAccountPayment = (paymentData) => (dispatch, getState) => {
  const { auth, customers } = getState();
  const { amount, card_type, customerAccountPaymentType, customerAccountReason } = paymentData;

  const transaction = {
    aid: auth.aid,
    uid: auth.user.uid,
    userName: auth.user.displayName,
    value: Math.abs(amount),
    type: customerAccountPaymentType,
    reason: customerAccountReason,
    customerId: customers.detail.id,
    paymentType: (card_type === 'credit_card') ? PaymentType.items[PaymentType.CREDIT].type : PaymentType.items[PaymentType.DEBIT].type,
    obs: null,
  };

  dispatch(customerAccountEditBalance(transaction, () => {
    dispatch(stopLoading());
    NavigationService.pop({ n: 2, immediate: true });
  }, () => Alert.alert(I18n.t('unsavedChangesTitle'), I18n.t('generalErrorTitle'), [{ text: I18n.t('alertDiscard') }])));
};

export const mercadoPagoSalePayment = (mercadoPagoData) => (dispatch, getState) => {
  const { externalPayments, currentSale, preference } = getState();
  setTimeout(() => {
    const { isActivated, errorDisplayed, processingLastTransaction } = externalPayments.mercadoPago;

    if (!isActivated) return;
    if (processingLastTransaction) return;
    else dispatch({ type: MERCADOPAGO_SET_PROCESSING, payload: true });

    // if (common.actualRouteName !== 'Payment') NavigationService.navigate('Checkout', 'Payment');
    // if ((mercadoPagoData.result_status === 'FAILED' || mercadoPagoData.result_status === 'USER_CANCELLED_ERROR') && !errorDisplayed) {
    //   dispatch({ type: MERCADOPAGO_SET_ERROR_DISPLAYED, payload: true });
    //   dispatch({ type: MERCADOPAGO_SET_PROCESSING, payload: false });
    //   return Alert.alert(I18n.t('words.s.attention'), MercadoPago.getReasonForRejection(mercadoPagoData.error_detail));
    // }

    const isSplit = mercadoPagoData.is_split === 'true';
    const finishSale = (sale) => {
      dispatch(stopLoading());
      if (isSplit) {
        dispatch(currentSaleSplitPayment());
        NavigationService.navigate('Payment', 'SplitPayment');
      } else {
        dispatch(currentSaleSetStatus(null, sale.status));
        NavigationService.navigate('Receipt', 'Receipt');
      }

      setTimeout(() => dispatch({ type: MERCADOPAGO_SET_PROCESSING, payload: false }), 1000);
    };
    const paymentData = { amount: mercadoPagoData.amount, installments: mercadoPagoData.installments, card_type: mercadoPagoData.card_type, payment_id: mercadoPagoData.payment_id };
    dispatch(mercadoPagoProcessSale(paymentData, isSplit, currentSale, preference.account.currency.currencyCode, (sale) => finishSale(sale)));
  }, 1000);
};

export const mercadoPagoProcessSale = (paymentData, isSplit, currentSale, currency, finishSaleCb) => async (dispatch) => {
  const { amount, installments, card_type, payment_id } = paymentData;
  const paymentType = (card_type === 'credit_card') ? PaymentType.items[PaymentType.CREDIT] : PaymentType.items[PaymentType.DEBIT];
  const mercadoPagoPayment = {
    type: paymentType.type,
    description: paymentType.description,
    totalNet: Number(amount),
    isSplit,
    transaction_code: payment_id,
    transaction: {
      cardType: card_type,
      cardLast4Digits: '',
      currency,
      installments: Number(installments),
      type: (card_type === 'credit_card') ? 'CREDIT' : 'DEBIT',
      transactionId: payment_id,
      gateway: PaymentGatewayType.items[PaymentGatewayType.MERCADO_PAGO_CARD_READER].type,
    },
  };

  await dispatch(currentSaleAddPayment(mercadoPagoPayment.type, mercadoPagoPayment.description, mercadoPagoPayment.totalNet, mercadoPagoPayment.isSplit, mercadoPagoPayment.transaction_code, mercadoPagoPayment.transaction));
  if (finishSaleCb) {
    finishSaleCb(currentSale);
    // finishSaleCb('closed', true);
  }
};
