import { defaultLocales } from './util-currency';
//import I18n from 'react-native-i18n';

export const formatCurrencyValue = (value, currency, hasDecimal = true, removeCurrency = false) => {
  const { currencyCode = 'USD', localeIdentifier } = currency;
  const lang = (defaultLocales[currencyCode] || localeIdentifier).replace(/_/g, '-');
  //const lang = I18n.currentLocale(); // This avoid (for example) arabic numbers in a 'fr' celphone setting

  let options = {
    style: removeCurrency ? 'decimal' : 'currency',
    currency: currencyCode || 'USD',
    currencyDisplay: 'symbol',
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  };

  return new Intl.NumberFormat(lang, options).format(value);
};

export const currencyValueFormatter = (value, currency, removeCurrency = false, minimumFractionDigits) => {
  const { currencyCode = 'USD', decimalCurrency, localeIdentifier } = currency;
  const lang = (defaultLocales[currencyCode] || localeIdentifier).replace(/_/g, '-');
  //const lang = I18n.currentLocale(); // This avoid (for example) arabic numbers in a 'fr' celphone setting

  let options = {
    currency: currencyCode || 'USD',
    currencyDisplay: 'symbol',
  };

  if (!removeCurrency) options.style = 'currency';
  if (minimumFractionDigits) options.minimumFractionDigits = minimumFractionDigits;
  else if (!decimalCurrency) options.minimumFractionDigits = 0;

  return new Intl.NumberFormat(lang, options).format(value);
};

export const isCurrencySymbolAtLeft = (value, currency) => {
  const { currencyCode = 'USD', localeIdentifier } = currency;
  const lang = (defaultLocales[currencyCode] || localeIdentifier).replace(/_/g, '-');

  const currencyString = new Intl.NumberFormat(lang, { style: 'currency', currency: currencyCode, currencyDisplay: 'code' }).format(Math.abs(value));
  return currencyString.slice(0, 3) === currencyCode;
};

export const truncateNoRounding = (value) => {
  const number = Number(value);
  return Math.floor(number * 100) / 100;
};
