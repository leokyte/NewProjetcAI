import { colors, colorsPierChart } from '../styles';
import I18n from '../i18n/i18n';

const Strings = {
  ALL_LABEL: I18n.t('defaultStatus.all'),
  OPENED_LABEL: I18n.t('words.p.pending'),
  CONFIRMED_LABEL: I18n.t('words.p.confirmed'),
  AWAITING_PAYMENT_LABEL: I18n.t('defaultStatus.awaitingPayment'),
  PAID_LABEL: I18n.t('defaultStatus.paid'),
  PRODUCTION_LABEL: I18n.t('defaultStatus.production'),
  EXPEDITION_LABEL: I18n.t('defaultStatus.expedition'),
  OUT_FOR_DELIVERY_LABEL: I18n.t('defaultStatus.delivery'),
  READY_TO_PICKUP_LABEL: I18n.t('defaultStatus.pickup'),
};

export const OrderStatus = {
  ALL: 0,
  OPENED: 1,
  CONFIRMED: 2,
  AWAITING_PAYMENT: 3,
  PAID: 4,
  PRODUCTION: 5,
  EXPEDITION_LABEL: 6,
  OUT_FOR_DELIVERY: 7,
  READY_TO_PICKUP: 8,
  items: [
    { key: 0, status: '', alias: Strings.ALL_LABEL, color: colors.primaryColor, active: true },
    { key: 1, status: 'opened', alias: Strings.OPENED_LABEL, color: colors.primaryColor, active: true, isDefault: true, isFree: true },
    { key: 2, status: 'confirmed', alias: Strings.CONFIRMED_LABEL, color: colors.actionColor, active: true, isDefault: true, isFree: true },
    { key: 3, status: 'kyte-awaiting-payment', alias: Strings.AWAITING_PAYMENT_LABEL, color: colors.primaryColor, active: true, isDefault: true, isFree: true },
    { key: 4, status: 'kyte-paid', alias: Strings.PAID_LABEL, color: colors.actionDarkColor, active: true, isDefault: true, isFree: false },
    { key: 5, status: 'in-production', alias: Strings.PRODUCTION_LABEL, color: colorsPierChart[5], active: true, isDefault: true },
    { key: 6, status: 'expedition', alias: Strings.EXPEDITION_LABEL, color: colorsPierChart[3], active: true, isDefault: true },
    { key: 7, status: 'out-for-delivery', alias: Strings.OUT_FOR_DELIVERY_LABEL, color: colorsPierChart[1], active: true, isDefault: true },
    { key: 8, status: 'ready-to-pickup', alias: Strings.READY_TO_PICKUP_LABEL, color: colorsPierChart[2], active: true, isDefault: true },
  ],
};

export const ORDER_STATUS_CLOSED = 'closed'
