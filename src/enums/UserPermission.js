import React from 'react';
import I18n from '../i18n/i18n';
import { KyteText } from '../components/common';

export const UserPermission = {
  ADMIN: 0,
  PERSONAL_PHONE: 1,
  SEE_ALL_SALES: 2,
  GIVE_DISCOUNT: 3,
  MANAGE_PRODUCTS: 4,
  MANAGE_STOCK: 5,
  ALLOW_CUSTOMER_IN_DEBT: 6,
  items: [
    { type: 0, text: I18n.t('userPermissionAdmin'), hasTip: true },
    { type: 1, text: I18n.t('userPermissionPersonalPhone'), hasTip: true },
    { type: 2, text: I18n.t('userPermissionOtherSells') },
    { type: 3, text: I18n.t('userPermissionGiveDiscount') },
    { type: 4, text: I18n.t('userPermissionCreateProducts') },
    { type: 5, text: I18n.t('userPermissionStock'), hasTip: true },
    { type: 6, text: I18n.t('customerAccount.userPermissionAllowCustomerInDebt'), hasTip: true }
  ],
  itemsWithTip: [
    {
      type: 0,
      getTitle: () => I18n.t('userNewToolbarTitlePermissionsAdmin'),
      getDescription: (userName) => (
        <KyteText size={16}>
          {I18n.t('userPermissionAdminText1')}<KyteText weight="SemiBold" size={16}> {userName} </KyteText> {I18n.t('userPermissionAdminText2')}<KyteText weight="SemiBold" size={16}> {I18n.t('userPermissionAdminText3')} </KyteText>{I18n.t('userPermissionAdminText4')}
        </KyteText>
      ),
      getImageName: () => 'Admin',
      getButtonText: () => I18n.t('userPermissionAdminButton'),
      getObservation: () => null,
    },
    {
      type: 1,
      getTitle: () => I18n.t('userNewToolbarTitlePermissionsPersonalAccess'),
      getDescription: (userName) => (<KyteText size={16}>{I18n.t('userPermissionPersonalPhoneText1')} <KyteText weight="SemiBold" size={16}>{userName}</KyteText> {I18n.t('userPermissionPersonalPhoneText2')}</KyteText>),
      getImageName: () => 'PersonalAccess',
      getButtonText: () => I18n.t('userPermissionPersonalPhoneButton'),
      getObservation: () => null,
    },
    {
      type: 5,
      getTitle: () => I18n.t('userPermissionStockModalTitle'),
      getDescription: (userName) => (<KyteText size={16}>{I18n.t('userPermissionStockText1')} <KyteText weight="SemiBold" size={16}>{userName}</KyteText> {I18n.t('userPermissionStockText2')}</KyteText>),
      getImageName: () => 'StockBoxes',
      getButtonText: () => I18n.t('userPermissionStockButton'),
      getObservation: () => I18n.t('userPermissionModalObservation'),
    },
    {
      type: 6,
      getTitle: () => I18n.t('customerAccount.userPermissionAllowCustomerInDebtTipTitle'),
      getDescription: (userName) => (<KyteText size={16}>{I18n.t('customerAccount.userPermissionAllowCustomerInDebtText1')} <KyteText weight="SemiBold" size={16}>{userName}</KyteText> {I18n.t('customerAccount.userPermissionAllowCustomerInDebtText2')}</KyteText>),
      getImageName: () => 'AllowCustomerInDebt',
      getButtonText: () => I18n.t('customerAccount.userPermissionAllowCustomerInDebtButton'),
      getObservation: () => I18n.t('customerAccount.userPermissionAllowCustomerInDebtObservation'),
    },
  ]
};
