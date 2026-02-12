import { Linking, Alert } from 'react-native';
import I18n from '../i18n/i18n';
import { MercadoPagoPaymentType } from '../enums';

class MercadoPago {
  constructor(build) {
    this.mercadoPagoUrl = 'https://www.mercadopago.com/point/integrations';
    this.amount = build.amount;
    this.description = build.description;
    this.external_reference = build.external_reference;
    this.payer_email = build.payer_email;
    this.notification_url = build.notification_url;
    this.success_url = build.success_url;
    this.fail_url = build.fail_url;
    this.is_split = build.is_split;
    this.type = build.type;
    this.customerAccountPaymentType = build.customerAccountPaymentType || null;
    this.customerAccountReason = build.customerAccountReason || null;
  }

  invokeApp() {
    Linking.canOpenURL(this.mercadoPagoUrl).then(canOpenUrl => {
      if (!canOpenUrl) {
        return Alert.alert(I18n.t('words.s.attention'), 'Parece que seu aparelho não suporta o MercadoPago. :(');
      }
      let url = `?amount=${this.amount}&description=${this.description}&external_reference=${this.external_reference}&success_url=${this.success_url}&fail_url=${this.fail_url}&notification_url=${this.notification_url}`;
      if (this.payer_email) {
        url += `&payer_email=${this.payer_email}`;
      }
      Linking.openURL(`${this.mercadoPagoUrl}${url}`).catch(error => Alert.alert(I18n.t('words.s.attention'), 'Não foi possível abrir o aplicativo do MercadoPago. :('));
    });
  }

  static getReasonForRejection(reason) {
    const failMessage = I18n.t('paymentMachines.payment.mercadoPago.fails.failMessage');
    switch (reason) {
      default:
        return I18n.t('paymentMachines.payment.mercadoPago.fails.failMessageGeneral');
      case 'PAYMENT_REJECTED':
        return `${failMessage} ${I18n.t('paymentMachines.payment.mercadoPago.fails.cardRejected')}`;
      case 'USER_CANCELLED_ERROR':
        return `${failMessage} ${I18n.t('paymentMachines.payment.mercadoPago.fails.userCancelled')}`;
    }
  }

  static get Builder() {
    class Builder {
      constructor(amount, description, payer_email, external_reference, is_split, type = MercadoPagoPaymentType.SALE, customerAccountPaymentType = null, customerAccountReason = null) {
        if (!amount) {
          throw new Error('You must inform the AMOUNT value.');
        }
        if (!description) {
          throw new Error('You must inform the DESCRIPTION value.');
        }
        if (!external_reference) {
          throw new Error('You must inform the EXTERNAL_REFERENCE value.');
        }

        this.amount = amount;
        this.description = description;
        this.payer_email = payer_email;
        this.external_reference = external_reference;
        this.is_split = is_split;
        this.type = type;
        this.customerAccountPaymentType = customerAccountPaymentType;
        this.customerAccountReason = customerAccountReason;

        this.notification_url = escape(`https://app.kytepos.com/mercadopago?is_split=${this.is_split}&type=${this.type}`);
        this.success_url = escape(`https://app.kytepos.com/mercadopago?is_split=${this.is_split}&type=${this.type}`);
        this.fail_url = escape(`https://app.kytepos.com/mercadopago?is_split=${this.is_split}&type=${this.type}`);

        if (this.customerAccountPaymentType && this.customerAccountReason) {
          this.notification_url += escape(`&customerAccountPaymentType=${this.customerAccountPaymentType}&customerAccountReason=${this.customerAccountReason}`);
          this.success_url += escape(`&customerAccountPaymentType=${this.customerAccountPaymentType}&customerAccountReason=${this.customerAccountReason}`);
          this.fail_url += escape(`&customerAccountPaymentType=${this.customerAccountPaymentType}&customerAccountReason=${this.customerAccountReason}`);
        }
      }

      build() {
        return new MercadoPago(this);
      }
    }
    return Builder;
  }
}

export { MercadoPago };
