import I18n from '../i18n/i18n';
const { at_sight, x_installments } = I18n.t('expressions.installments');

export const InstallmentType = {
  AT_SIGHT: 0,
  ONE_INSTALLMENT: 1,
  TWO_INSTALLMENTS: 2,

  items: {
    0: { type: 0, description: at_sight },
    1: { type: 1, description: x_installments.replace('$y', '1') },
    2: { type: 2, description: x_installments.replace('$y', '2') },
  },
};
