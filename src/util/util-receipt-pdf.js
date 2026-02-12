import moment from 'moment/min/moment-with-locales';
import { renderProductVariationsName } from '@kyteapp/kyte-utils';
import I18n from '../i18n/i18n';
import { renderShippingValue, currencyFormatter, formatNoDecimalValue } from ".";
import { colors } from '../styles';
import { PaymentType } from '../enums';

// eslint-disable-next-line import/prefer-default-export
export const generateReceiptPDF = (_sale, storeAuth, user, multiUsers, currency, decimalCurrency, haveInternet, isAndroid, shouldShowCTA) => {
  const store = {
    name: storeAuth.name,
    email: !storeAuth.email ? user.email : storeAuth.email,
    storeImage: storeAuth.imageBase64,
    phone: storeAuth.phone,
    headerExtra: storeAuth.headerExtra || '',
    footerExtra: storeAuth.footerExtra || '',
    address: storeAuth.address || '',
    addressComplement: storeAuth.addressComplement || '',
  };

  const sale = {
    ..._sale,
    customer: _sale.customer,
    dateCreationFormatted: true,
    number: renderSaleNumber(multiUsers, _sale),
    tax: _sale.taxes.length && _sale.totalTaxes ? _sale.taxes[0] : null,
    itemLabel: _sale.items.length > 1 ? I18n.t('words.p.item') : I18n.t('words.s.item'),
    itemsQty: _sale.items.reduce((total, item) => total + item.amount, 0),
  };

  const isOnlyPayLaterPayment = sale.payments.length === 1 && sale?.payments[0]?.type === PaymentType.PAY_LATER;
  const accountPaymentType = PaymentType.items[PaymentType.ACCOUNT].type;
  const payLaterPayment = PaymentType.items[PaymentType.PAY_LATER].type;
  const hasCustomerAccountPayment = sale.payments.length > 0 ? sale.payments.filter(p => p.type === accountPaymentType || p.type === payLaterPayment).length : false;
  const generateCustomerAccountBalance = () => `<div>${I18n.t('words.s.balance')}: ${currencyFormat(decimalCurrency, currency, sale.customer.accountBalance)}</div>`;
  const hasPayments = sale.payments.length > 0;
  const customerAddressComplement = sale?.customer?.addressComplement ? ` - ${sale.customer.addressComplement}` : '';
  const { shippingFee, shippingCouponDiscount } = sale;

  const html = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" /><!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=Edge" /><!--<![endif]-->
      <style type="text/css">
        table { width:100%; }
        table tr td { padding: 0px; }
        a { text-decoration: none; }
        .margin-top-10 { margin-top: 10px }
        .margin-top-30 { margin-top: 30px }
        .margin-bottom-5 { margin-bottom: 5px }
        .min-width-30 { min-width: 30px; }
        .padding-top-40 { padding-top: 40px; }
        .padding-top-30 { padding-top: 30px; }
        .padding-top-10 { padding-top: 10px; }
        .line-bold { height: 2px;background-color: #444E5E;margin: 10px 0 0; }
        .line-regular { border-bottom: 1px solid #efefef; }
        .min-size { min-width: 310px; }
        .hidden { display:none; }
        .font-normal { font-weight: normal; }
        .font-bold { font-weight: bold; }
        .primary-color { color: #4d5461; }
        .text-light { color: #a9b1be; font-size: 12px; }

        .info-title { font-weight: bold; font-size: 12px; }
        .container-receipt { font-family: Sans-Serif;color:#444E5E;font-size: 12px;font-weight: 700; }
        .content-receipt { min-width: 350px;max-width: 550px;margin: 0px auto;background: white;position: relative;box-sizing: border-box;padding: 15px 0px;box-shadow: none; }
        .container-img { vertical-align: text-top;float:left; }
        .container-img img { max-width: 100px; max-height: 75px; }
        .receipt-title { text-align: right;font-size: 22px; }
        .receipt-title img { margin-right: 7px; }
        .name-company { font-weight: 400;font-size: 11px; }
        .phone-company { font-weight: 500;font-size: 11px;color: #A9B1BE; }
        .withoutImage .receipt-title, .withoutImage .name-company, .withoutImage .phone-company { text-align: center; }
        .header-grid .amount-total { width: 30%;white-space: nowrap;font-size: 12px; }
        .header-grid .to-customer { text-align: right;width: 200px;white-space: nowrap;font-size: 12px; }
        .container-product td { font-weight: 500;padding: 10px 0; }
        .container-product .amount { white-space: nowrap;font-size: 12px; }
        .container-product .content-description { width:100%;max-width:200px; padding-right: 5px; padding-left: 5px;}
        .container-product .content-description .description { font-weight: 700; width:80%;min-width:175px;font-size: 12px; }
        .container-product .content-value { width: 100%;max-width: 105px; }
        .container-product .content-value .value { text-align: right;white-space: nowrap; font-size: 12px; }
        .subtotal { text-align: right;font-weight: 500; font-size: 12px; }
        .discount { text-align: right;color: red;padding: 10px 0 0 0;font-size: 12px; }
        .total { text-align: right;font-size: 20px;padding: 10px 0 5px 0; }
        .title-payment-methods { padding: 15px 0 10px 0;font-size: 12px; }
        .payment-method { font-weight: 500; }
        .payment-method .description { font-weight: 700;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;padding: 0;font-size: 12px; text-align: right;}
        .payment-method .value { text-align: right;padding: 10px 0;font-size: 12px; white-space: nowrap; }
        .one.payment-method .description { font-weight: 600;padding: 0 0 15px;text-align: right; }
        .footer-receipt td { text-align: center;font-size: 12px; }
        .footer-receipt .date-receipt { padding: 10px 0;font-weight: 500;color: #A9B1BE; }
        .cut-final { min-width: 310px;max-width: 450px;position: relative;margin: 0px auto;letter-spacing: -4px;overflow: hidden;text-overflow: clip;display: flex; }
        .cut-final .base-cut { content: '';display: inline-block;vertical-align: top;width: 0;height: 0;border-top: 7px solid #fff; }
        .cut-final .base-cut.left { border-left: 0px solid transparent;border-right: 8.5px solid transparent; }
        .cut-final .base-cut.center { border-left: 6.028px solid transparent;border-right: 6.028px solid transparent; }
        .cut-final .base-cut.right { border-left: 8.5px solid transparent;border-right: 0px solid transparent; }
        .footer { margin: 40px 0 0; }
        .footer .container-logo-kyte { margin: 0px auto;position: relative;box-sizing: border-box;max-width: 35px; }
        .footer .container-logo-kyte .logo-kyte { width:35px;height:35px;border-radius:4px; }
        .footer .copyright { text-align: center;font-weight: 500;font-size: 10px;padding: 10px 0px; }
        .footer .device { text-align: center;font-weight: 500;font-size: 11px; }
        .observation-container { padding: 10px; border: solid; border-width: 2px; border-color: #363f4d; border-radius: 8px; }
        .observation { font-weight: bold; line-height: 17px; color: #4d5461; font-size: 11px; }
        .observation-title { font-size: 13px; margin-bottom: 5px; }
        .store-info-td { width: 55%; padding-right: 5%; }
        .customer-info-td { width: 45%; }
        .crossed-text { text-decoration: line-through; }
        .cta-container { background-color: #eff1f3; height: 62px; display: flex; flex-direction: row; justify-content: center; align-items: center; padding: 0 20px; bottom: 0;}
        .cta-text { font-size: 9px; color: #363f4d; line-height: 13px; font-weight: 500; }
        .cta-link { text-decoration: underline; margin: 0; color: #2dd1ac}
        .container-product .content-value .discount-totalgross { color: ${colors.grayBlue}; text-decoration: line-through; margin-right: 5px; }
        .container-product .content-value .discount-percent { color: ${colors.errorColor}; }
      </style>

    </head>
    <body>
      <div class="container-receipt">
          <div class="content-receipt">
            <table class="min-size">
                <tr>
                    <td colspan="2">
                        ${
                          store.storeImage ?
                          `<div class="container-img">
                          <img src="data:image/png;base64, ${store.storeImage}" />
                          </div>` : ''
                        }
                        <div>
                          <div class="receipt-title">
                              ${
                                sale.status === 'closed' ?
                                `${isOnlyPayLaterPayment ? '' : I18n.t('words.s.receipt').toUpperCase()} ${sale.number}` :
                                `
                                  ${
                                    sale.status === 'opened' ?
                                    `${haveInternet ? '<img width="19px" height="19px" src="https://marketing-image-production.s3.amazonaws.com/uploads/d0b98666e4c08e2fc813ae751adff0eb7bcbd086badf445e9fd5bb16f8bb62a731e300e414d1d11fe69b7082ab763857ba00f553b1e6f105319d553351bd7886.png" > ' : ''}${sale.number}` :
                                    `${haveInternet ? '<img width="19px" height="19px" src="https://marketing-image-production.s3.amazonaws.com/uploads/640392afabbbc3ec4fc6cda876c189e91010a3ae9d6f3717f4cbec477cebf445cb7aa6723376e55f45fccd76e2b03ef526d07ec87dd43b72c5abb627a72f1365.png" > ' : ''}${sale.number}`
                                  }
                                `
                              }
                          </div>
                        </div>
                    </td>
                </tr>
            </table>
            <table class="min-size">
              <tr class="store-customer-info">
                  <td class="store-info-td" valign="top">
                    ${
                      store.name ?
                      `<div class="name-company margin-top-10 margin-bottom-5">
                          <div class="info-title">${store.name}</div>
                          ${
                            store.phone ?
                            `<div>${store.phone}</div>` : ''
                          }
                          ${
                            store.address ?
                              `<div>${store.address}${store.addressComplement ? ` - ${store.addressComplement}` : ''}</div>` : ''
                          }
                          ${
                            store.headerExtra ?
                            `<div>${store.headerExtra}</div>` : ''
                          }

                      </div>` : ''
                    }
                  </td>
                  <td class="customer-info-td" valign="top">
                    ${
                      sale.customer ?
                      `<div class="name-company margin-top-10 margin-bottom-5">
                        <div class="info-title">
                          ${haveInternet ? '<img width="13px" height="13px" src="https://marketing-image-production.s3.amazonaws.com/uploads/66a519e487b9213127bdb5e1c45f6d4c7a54d8c47449adb4d35caddcd7ebb57eccf385e62d6118dd5a267d140885501d0584ff7841e890ff8043ec758ed96b53.png" />' : ''}
                          ${sale.customer.name}
                        </div>                        
                        ${sale.customer.celPhone ? `<div>${sale.customer.celPhone}</div>` : ''}
                        ${sale.customer.address ? `<div>${sale.customer.address}${customerAddressComplement}</div>` : ''}
                        ${hasCustomerAccountPayment ? generateCustomerAccountBalance() : ''}
                      </div>` : ''
                    }
                  </td>
              </tr>
            </table>

            ${
              sale.observation ?
              `<table class='margin-top-10'>
                <tr>
                  <td class="observation observation-container">
                    <div>${sale.observation}</div>
                  </td>
                <tr>
              </table>` : ''
            }

            <table class="min-size margin-top-30 header-grid">
              <tr>
                <td class="amount-total">
                  ${sale.items.length} ${sale.itemLabel} (${I18n.t('words.s.qty')}: ${sale.itemsQty})
                </td>
              </tr>
            </table>

            <table class="min-size">

                <tr><td colspan="3" class="line-bold"></td></tr>

                ${renderItemList(sale.items, decimalCurrency, currency)}
            </table>

            <table class="min-size">
               ${
                  sale.discountValue || sale.tax ?
                  `<tr>
                    <td colspan="3" class="subtotal padding-top-10">
                        ${I18n.t('words.s.subtotal')} ${currencyFormat(decimalCurrency, currency, sale.totalGross)}
                    </td>
                  </tr>` : ''
                }


                ${
                  sale.discountValue ?
                  `<tr>
                    <td colspan="3" class="discount">
                      ${I18n.t('words.s.discount')}: (${sale?.discountPercent}%) ${currencyFormat(decimalCurrency, currency, sale.discountValue)}
                    </td>
                  </tr>` : ''
                }

                ${sale?.totalCouponDiscount ? `
                  <tr>
                    <td colspan="3" class="discount">
                      ${I18n.t('coupons.coupon')} (${sale?.appliedCoupon?.code || sale?.appliedCoupon?.name}):  -${currencyFormat(decimalCurrency, currency, sale.totalCouponDiscount)}
                    </td>
                  </tr>
                  ` : ''}

                ${
                  sale.tax ?
                  `<tr>
                    <td colspan="3" class="subtotal padding-top-10">
                      ${sale.tax.name}${sale.tax.typePercentFixed === 'percent-tax' ? ` (${sale.tax.percent}%)` : ''}: ${currencyFormat(decimalCurrency, currency, sale.totalTaxes)}
                    </td>
                  </tr>` : ''
                }

                ${
                  sale.shippingFee ?
                  `<tr>
                    <td colspan="3" class="subtotal padding-top-10">
                      ${I18n.t('catalogOrderDelivery')} (${sale.shippingFee.name}): ${renderShippingValue({
                        shippingFee: shippingFee?.value,
                        shippingCouponDiscount,
                        renderCurrency: (value) => currencyFormat(decimalCurrency, currency, value)
                      })}
                    </td>
                  </tr>
                  ` : ''
                }

                ${
                  sale.shippingCouponDiscount
                    ? `<tr>
                        <td colspan="3" class="subtotal padding-top-10" style="padding-top:10px;">
                          <span style="
                            display:inline-flex;
                            align-items:center;
                            justify-content:center;
                          ">
                            ${I18n.t('coupons.coupon')}:
                            <span 
                              style="
                                display:inline-flex;
                                align-items:center;
                                justify-content:center;
                                margin-left:8px;padding:4px 8px;
                                border-radius:999px;
                                background-color:rgba(21,24,30,0.04);
                                text-transform:uppercase;
                                color:rgba(21,24,30,0.48);"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.99942 4.01677C8.26332 4.01677 8.47695 4.2304 8.47695 4.49431V5.41205C8.67555 5.4573 8.86246 5.5316 9.03071 5.64148C9.34408 5.84624 9.5572 6.14833 9.66924 6.51334C9.74653 6.76555 9.60408 7.0332 9.35192 7.11065C9.09979 7.18781 8.83285 7.04615 8.75539 6.79411C8.70183 6.61954 8.61504 6.51174 8.50806 6.44179C8.39506 6.36798 8.22165 6.31197 7.96286 6.3119C7.38968 6.3119 7.20634 6.60264 7.20611 6.81277C7.20612 6.9198 7.22287 6.97558 7.23645 7.0041C7.24796 7.02821 7.26738 7.05626 7.31733 7.09043C7.44381 7.17683 7.69218 7.25931 8.18452 7.34631C8.66934 7.43334 9.12304 7.55313 9.44992 7.8114C9.82132 8.10509 9.96164 8.51495 9.96167 8.99358C9.96165 9.44495 9.78597 9.85255 9.42658 10.1345C9.16743 10.3378 8.84114 10.4529 8.47695 10.4977V11.3564C8.47675 11.6201 8.2632 11.8339 7.99942 11.8339C7.73563 11.8339 7.52208 11.6201 7.52188 11.3564V10.4643C7.24583 10.4093 6.99535 10.313 6.77913 10.1672C6.41053 9.91847 6.17942 9.55599 6.08227 9.13124C6.02349 8.874 6.18435 8.61764 6.44159 8.55882C6.69876 8.50011 6.95514 8.661 7.01401 8.91813C7.06182 9.1271 7.1628 9.27381 7.31344 9.37545C7.47233 9.48257 7.72455 9.56444 8.10675 9.56444C8.49009 9.56441 8.7163 9.47648 8.83627 9.38245C8.94096 9.30031 9.0058 9.18309 9.00582 8.99358C9.0058 8.71554 8.93593 8.62339 8.85727 8.56115C8.73375 8.46356 8.49508 8.37232 8.01808 8.2866C7.53283 8.20085 7.09392 8.0947 6.77835 7.87906C6.60751 7.76225 6.46705 7.61025 6.37392 7.41475C6.28289 7.22355 6.25027 7.01824 6.25026 6.81277C6.25045 6.04338 6.81799 5.54819 7.52188 5.40271V4.49431C7.52188 4.2304 7.73551 4.01677 7.99942 4.01677Z" fill="#15181E" fill-opacity="0.48"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4707 0.800781C13.9723 0.800781 15.1998 2.02768 15.1998 3.5299V6.16569C15.1998 6.42905 14.9864 6.64321 14.723 6.644C13.9742 6.64577 13.3682 7.25251 13.3682 8.00117C13.3684 8.74972 13.9739 9.35556 14.7223 9.35678C14.9859 9.3572 15.1998 9.57148 15.1998 9.8351V12.4709C15.1998 13.9731 13.9723 15.2008 12.4707 15.2008H3.52814C2.02559 15.2008 0.799805 13.973 0.799805 12.4709V9.83121C0.799805 9.5673 1.01343 9.3529 1.27734 9.3529C1.3005 9.3529 1.32043 9.3552 1.33567 9.35678C2.07847 9.34983 2.67867 8.7461 2.67884 8.00117C2.67884 7.25582 2.07831 6.65018 1.33567 6.64322C1.32042 6.64481 1.30055 6.64789 1.27734 6.64789C1.01343 6.64789 0.799805 6.43348 0.799805 6.16957V3.5299C0.799805 2.02779 2.02559 0.800781 3.52814 0.800781H12.4707ZM3.52814 1.75586C2.55385 1.75586 1.75488 2.55516 1.75488 3.5299V5.72859C2.82553 5.93133 3.6347 6.8724 3.6347 8.00117C3.63454 9.12995 2.82517 10.0688 1.75488 10.2714V12.4709C1.75488 13.4456 2.55385 14.2449 3.52814 14.2449H12.4707C13.4443 14.2449 14.244 13.4455 14.244 12.4709V10.2621C13.1975 10.0409 12.4133 9.11323 12.4131 8.00117C12.4131 6.88873 13.1974 5.95951 14.244 5.73792V3.5299C14.244 2.55527 13.4443 1.75586 12.4707 1.75586H3.52814ZM1.23145 10.3064C1.233 10.3066 1.23486 10.3062 1.2369 10.3064C1.23067 10.3055 1.22606 10.3051 1.22445 10.3049C1.22623 10.3051 1.22871 10.3061 1.23145 10.3064ZM1.23145 5.69437C1.22872 5.6947 1.22623 5.69567 1.22445 5.69593C1.22609 5.69566 1.23063 5.6945 1.2369 5.69359C1.23483 5.69381 1.23302 5.69418 1.23145 5.69437Z" fill="#15181E" fill-opacity="0.48"/>
                              </svg>
                              <span style="margin-left: 4px;">
                                ${sale.appliedCoupon?.code || sale.appliedCoupon?.name || ''}
                              </span>
                            </span>
                          </span>
                        </td>
                      </tr>`
                    : ''
                }

                <tr>
                  <td colspan="3" class="total">
                    Total: ${currencyFormat(decimalCurrency, currency, sale.totalNet)}
                  </td>
                </tr>

                ${hasPayments ? renderPayments(sale.payments, decimalCurrency, currency) : ''}

                <tr> <td style="padding: 10px 0;"></td> </tr>

                ${
                  sale.payBack ?
                  `<tr class="payment-method">
                    <td colspan="3" class="description">
                      ${I18n.t('words.s.change')}: ${currencyFormat(decimalCurrency, currency, sale.payBack)}
                    </td>
                  </tr>` : ''
                }

                <tr><td colspan="3" class="line-bold"></td></tr>

                <tr class="footer-receipt">
                    <td colspan="3" class="${store.footerExtra ? 'padding-top-40' : 'padding-top-30'} message-recepit">
                        ${store.footerExtra || ''}
                    </td>
                </tr>
                <tr class="footer-receipt">
                    <td colspan="3" class="date-receipt">
                        ${moment(sale.dateCreation).format('LLL')}
                    </td>
                </tr>

            </table>

            ${shouldShowCTA ?
              `<div class="cta-container">
                <p class="cta-text">
                  ${I18n.t('productSharingReceiptText')}
                  <a href="${I18n.t('productSharingReceiptLink')}" class="cta-link">
                    ${I18n.t('productSharingReceiptTextButton')}
                  </a>
                </p>
              </div>`
             : '' }
          </div>
      </div>
     </body>
  </html>`;

  // const doc = isAndroid ? html.replace(/#/g, '%23') : html;
  const doc = html;
  return { doc, receiptName: `${I18n.t('words.s.receipt').toLowerCase()}-${sale.number.replace('#', '')}` };
};

const renderSaleNumber = (multiUsers, _sale) => {
  if (multiUsers && multiUsers.length > 1) {
    return (`#${_sale.did || 0}-${_sale.number}`);
  }
  return (`#${_sale.number}`);
};

const unitPrice = (shouldShowOldValue, oldValue, newValue, decimalCurrency, currency) => `${shouldShowOldValue ? `<span class="crossed-text">${currencyFormat(decimalCurrency, currency, oldValue)}</span>` : ''} ${currencyFormat(decimalCurrency, currency, newValue)}`;

const renderItemList = (items, decimalCurrency, currency) => {
  let itemList = '';
  items.forEach((item) => {
    const hasProduct = item.product;
    const productUnitValue = hasProduct ? item.product.unitValue : item.unitValue;
    const isFractioned = hasProduct && item.product.isFractioned;
    const originalUnitValue = hasProduct && item.product.originalUnitValue;
    const hasDifferentUnitValue = hasProduct && (originalUnitValue !== item.product.unitValue);
    const hasPromotionalValue = originalUnitValue && hasDifferentUnitValue;
    const shouldShowOldValue = hasPromotionalValue && originalUnitValue > item.unitValue;
    const shouldShowUnitPrice = hasProduct && (shouldShowOldValue || item.amount > 1 || isFractioned);
    const hasProductVariation = item?.product?.variations?.length > 0

    itemList += `
    <tr class="container-product">
      <td class="content-amount">
        <div class="amount">
          ${(item.product && item.product.isFractioned) ? item.fraction : item.amount}x&nbsp;
        </div>
      </td>
      <td class="content-description">
        <div class="description">${item.product ? item.product.name : item.description || `(${I18n.t('words.s.noDescr')})`}</div>
        ${hasProductVariation ? `<div class="primary-color">${renderProductVariationsName(item.product)}</div>` : ''}
        <div class="text-light">${shouldShowUnitPrice ? unitPrice(shouldShowOldValue, hasPromotionalValue ? originalUnitValue : productUnitValue, item.unitValue, decimalCurrency, currency) : ''}</div>
      </td>
      <td class="content-value">
        <div class="value">${currencyFormat(decimalCurrency, currency, item.value)}</div>
        ${
          item.value < item.grossValue ?
          `<div class="value">
            <span class="discount-totalgross">${currencyFormat(decimalCurrency, currency, item.grossValue)}</span>
            <span class="discount-percent">(${item?.discount?.discountPercent}%)</span>
          </div>` : ''
        }
      </td>
    </tr>
    <tr>
      <td colspan="3">
        <div class="line-regular"></div>
      </td>
    </tr>
    `;
  });
  return itemList;
};

const renderPayments = (payments, decimalCurrency, currency) => {
  let paymentsList = '';
  payments.forEach((payment) => {
    paymentsList += `
      <tr class="payment-method">
        <td colspan="3" class="description">
          ${payment.receiptDescription || payment.description}: ${currencyFormat(decimalCurrency, currency, payment.totalPaid || payment.total)}
        </td>
      </tr>
    `;
  });
  return paymentsList;
};

function currencyFormat(decimalCurrency, currency, value) {
  if (!decimalCurrency) return `${currency.currencySymbol} ${formatNoDecimalValue(value, currency)}`;
  return currencyFormatter({ quantity: value, currency: currency.currencyCode });
}
