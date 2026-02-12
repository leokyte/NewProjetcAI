import I18n from '../i18n/i18n';
import { SaleTaxTip, ProductTaxTip } from '../../assets/images';

export const TaxType = {
  SALE_TAX: 0,
  PRODUCT_TAX: 1,
  items: {
    0: { type: 0, name: 'sale-tax', description: I18n.t('taxesSaleOption'), tipInfo: { title: I18n.t('saleTaxesTipTitle'), message: I18n.t('saleTaxesTipMessage'), imageSource: SaleTaxTip } },
    1: { type: 1, name: 'product-tax', description: I18n.t('taxesProductOption'), tipInfo: { title: I18n.t('productTaxesTipTitle'), message: I18n.t('productTaxesTipMessage'), imageSource: ProductTaxTip } },
  },
};


export const TaxPercentFixedTypes = {
  PERCENT_TAX: 0,
  FIXED_TAX: 1,
  items: [
    { type: 0, name: 'percent-tax', description: I18n.t('taxesPercentOption') },
    { type: 1, name: 'fixed-tax', description: I18n.t('taxesFixedOption') },
  ],
};

export const TaxShippingFees = {
  name: 'shipping-fee',
  description: I18n.t('ShippingFees.PageTitle'),
};
