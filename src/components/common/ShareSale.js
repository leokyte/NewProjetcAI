import { MaskService } from 'react-native-masked-text';
import moment from 'moment/min/moment-with-locales';
import I18n from '../../i18n/i18n';

const ShareSale = (currentSale, type, outNumber) => {
  const { items, totalNet, discountValue, dateCreation, customer, observation, number } =
    currentSale;
  const bold = type === 'whatsapp' ? '*' : '';
  const italic = type === 'whatsapp' ? '_' : '';

  const addCurrency = (value) => MaskService.toMask('money', value.toFixed(2), { });
  const capitalize = (string) => string.replace(/\b\w/g, l => l.toUpperCase());

  const saleNumber = number
    ? `${I18n.t('words.s.numberAbbr')} ${number}`
    : `${I18n.t('words.s.numberAbbr')} ${outNumber}`;
  const saleTotal = `${bold}${I18n.t('words.s.total')}: ${addCurrency(totalNet)}${bold}`;
  const saleIntro = `${I18n.t('openedSaleShareIntro')} ${saleNumber}`;
  const saleDate = `${I18n.t('words.s.date')}: ${moment(dateCreation).format('L')}`;
  const saleDiscount = discountValue
    ? `${I18n.t('words.s.discount')}: ${addCurrency(discountValue)}\n`
    : '';
  const saleCustomer = customer ? `\n${I18n.t('words.s.customer')}: ${customer.name}` : '';
  const saleObservation = observation
    ? `\n\n${italic}${I18n.t('words.s.observation')}: ${observation}${italic}`
    : '';

  const saleItems = () => {
    return items
      .map((item) => {
        const { amount, product, value } = item;
        return `${amount}x ${
          product ? capitalize(product.name) : I18n.t('words.s.noDescrAbbr')
        } ${addCurrency(value)}\n`;
      })
      .join('');
  };

  return {
    title: saleIntro,
    message: `${saleIntro}\n${saleDate}${saleCustomer}\n\n${capitalize(
      I18n.t('words.p.item'),
    )}:\n${saleItems()}\n${saleDiscount}${saleTotal}${saleObservation}`,
    subject: saleIntro,
    social: type,
  };
};

export { ShareSale };
