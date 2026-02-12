import I18n from '../i18n/i18n';

const {
  stock,
  analytics,
  multiuser,
  printers,
  taxes,
  sales,
  cards,
  products,
  catalog,
  receipt,
  openedSales,
  exportReports,
  barcodeReader,
  customerAccount,
  customStatus,
  productGallery,
  shippingFees,
} = I18n.t('billingFeatures');

export const Features = {
  PRINTERS: 6,
  STOCK: 7,
  ANALYTICS: 8,
  OPENED_SALES: 9,
  MULTI_USER: 10,
  TAXES: 11,
  EXPORT: 12,
  CUSTOMER_ACCOUNT: 13,
  CUSTOM_STATUS: 14,
  PRODUCT_GALLERY: 15,
  SHIPPING_FEES: 16,
  CUSTOM_COLOR: 17,
  VARIANTS_PRO_PAYWALL: 18,
  AI_PRODUCT_DESCRIPTION: 19,
  VARIANTS_GROW_PAYWALL: 20,
  COUPONS_PRO_PAYWALL: 21,
  COUPONS_GROW_PAYWALL: 22,
  AI_PRODUCT_REGISTRATION_PAYWALL: 23,

  items: [
    // Free resources
    { key: 'sale', description: sales, icon: 'shopping_bags' },
    { key: 'cards', description: cards, icon: 'credit_card' },
    { key: 'products', description: products, icon: 'high_heel' },
    { key: 'catalog', description: catalog, icon: 'computer' },
    { key: 'shareReceipt', description: receipt, icon: 'page_facing_up' },
    { key: 'barcodeReader', description: barcodeReader, icon: 'mag_right' },

    // Pro resources
    { key: 'printers', description: printers, icon: 'printer', remoteKey: 'featurePrinters' },
    { key: 'stock', description: stock, icon: 'package', remoteKey: 'featureStock' },
    { key: 'analytics', description: analytics, icon: 'chart_with_upwards_trend', remoteKey: 'featureAnalytics' },
    { key: 'openedsales', description: openedSales, icon: 'moneybag', remoteKey: 'featureOpenedSales' },
    { key: 'multiuser', description: multiuser, icon: 'family', remoteKey: 'featureMultiUser' },
    { key: 'taxes', description: taxes, icon: 'money_with_wings', remoteKey: 'featureTaxes' },
    { key: 'export', description: exportReports, icon: 'bar_chart', remoteKey: 'featureExport' },
    { key: 'customeraccount', description: customerAccount, icon: 'dollar', remoteKey: 'featureCustomerAccount' },
    { key: 'customstatus', description: customStatus, icon: '', remoteKey: 'featureCustomStatus' },
    { key: 'productgallery', description: productGallery, icon: '', remoteKey: 'featureProductGallery' },
    { key: 'shippingfees', description: shippingFees, icon: '', remoteKey: 'featureShippingFees' },
    { key: 'customcolor', description: '', icon: '', remoteKey: 'featureCustomColor' },
    { key: 'variantspropaywall', description: '', icon: '', remoteKey: 'featureVariantsProPaywall' },
    
    // Grow resources
    { key: 'aiproductdescription', description: '', icon: '', remoteKey: 'featureAIProductDescription' },
    { key: 'variantsgrowpaywall', description: '', icon: '', remoteKey: 'featureVariantsGrowPaywall' },
    
    { key: 'couponspropaywall', description: '', icon: '', remoteKey: 'featureCouponsProPaywall' },
    { key: 'couponsgrowpaywall', description: '', icon: '', remoteKey: 'featureCouponsGrowPaywall' },
    
    // Prime resources
    { key: 'aiproductregistrationpaywall', description: '', icon: '', remoteKey: 'featureAIProductRegistration' },
  ],
};
