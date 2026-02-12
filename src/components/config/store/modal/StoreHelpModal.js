import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Icon } from 'react-native-elements';

import { KyteModal, TextButton } from '../../../common';
import CheckoutButton from '../../../common/CheckoutButton';
import { isIphoneX } from '../../../../util';
import { colors, colorSet, msg, Type } from '../../../../styles';
import {
  StoreConfigReceiptHeaderEN,
  StoreConfigReceiptHeaderES,
  StoreConfigReceiptHeaderPT,
  StoreConfigReceiptFooterEN,
  StoreConfigReceiptFooterES,
  StoreConfigReceiptFooterPT,
  StoreConfigCatalogExtraEN,
  StoreConfigCatalogExtraES,
  StoreConfigCatalogExtraPT,
} from '../../../../../assets/images';
import I18n from '../../../../i18n/i18n';

const headerImage = (type) => {
  switch (type) {
    case 'header':
      if (I18n.t('locale') === 'pt-br') {
        return StoreConfigReceiptHeaderPT;
      } else if (I18n.t('locale') === 'es') {
        return StoreConfigReceiptHeaderES;
      }
      return StoreConfigReceiptHeaderEN;
    case 'footer':
      if (I18n.t('locale') === 'pt-br') {
        return StoreConfigReceiptFooterPT;
      } else if (I18n.t('locale') === 'es') {
        return StoreConfigReceiptFooterES;
      }
      return StoreConfigReceiptFooterEN;
    case 'catalog-extra':
      if (I18n.t('locale') === 'pt-br') {
        return StoreConfigCatalogExtraPT;
      } else if (I18n.t('locale') === 'es') {
        return StoreConfigCatalogExtraES;
      }
      return StoreConfigCatalogExtraEN;
  }
};

const HeaderModal = {
  header: (
    <Image
      style={{ flex: 1, height: 250, width: 250 }}
      resizeMode={'contain'}
      source={{ uri: headerImage('header') }}
    />
  ),
  headerText: I18n.t('storeReceiptModalHelpHeaderTitle'),
  subHeaderText: I18n.t('storeReceiptModalHelpHeaderSubtitle'),
  linkText: I18n.t('storeReceiptModalHelpSeeReceipt'),
};

const FooterModal = {
  header: (
    <Image
      style={{ flex: 1, height: 250, width: 250 }}
      resizeMode={'contain'}
      source={{ uri: headerImage('footer') }}
    />
  ),
  headerText: I18n.t('storeReceiptModalHelpFooterTitle'),
  subHeaderText: I18n.t('storeReceiptModalHelpFooterSubtitle'),
  linkText: I18n.t('storeReceiptModalHelpSeeReceipt'),
};

const CatalogModal = {
  header: (
    <Image
      style={{ flex: 1, height: 250, width: 250 }}
      resizeMode={'contain'}
      source={{ uri: headerImage('catalog-extra') }}
    />
  ),
  headerText: I18n.t('storeReceiptModalHelpExtraTitle'),
  subHeaderText: I18n.t('storeReceiptModalHelpExtraSubtitle'),
  linkText: I18n.t('storeReceiptModalHelpSeeCatalog'),
};

const generate = {
  headerImage: (type) => {
    switch (type) {
      case 'header':
        return HeaderModal.header;
      case 'footer':
        return FooterModal.header;
      case 'catalog-extra':
        return CatalogModal.header;
      case 'instagram':
        return CatalogModal.header;
    }
  },
  headerText: (type) => {
    switch (type) {
      case 'header':
        return HeaderModal.headerText;
      case 'footer':
        return FooterModal.headerText;
      case 'catalog-extra':
        return CatalogModal.headerText;
      case 'instagram':
        return CatalogModal.headerText;
    }
  },
  headerSubText: (type) => {
    switch (type) {
      case 'header':
        return HeaderModal.subHeaderText;
      case 'footer':
        return FooterModal.subHeaderText;
      case 'catalog-extra':
        return CatalogModal.subHeaderText;
      case 'instagram':
        return CatalogModal.subHeaderText;
    }
  },
  linkText: (type) => {
    switch (type) {
      case 'header':
        return HeaderModal.linkText;
      case 'footer':
        return FooterModal.linkText;
      case 'catalog-extra':
        return CatalogModal.linkText;
      case 'instagram':
        return CatalogModal.linkText;
    }
  },
};

const StoreHelpModal = (props) => {
  const {
    modalContainer,
    imageModalContainer,
    textModalContainer,
    textModalHeader,
    textModalStyle,
    subTextModalStyle,
    modalButtonContainer
  } = styles;

  return (
    <KyteModal
      height={isIphoneX() ? '65%' : '75%'}
      title={''}
      isModalVisible
      noPadding
      noEdges
      hideModal={props.closeAction}
      hideOnBack={props.closeAction}
    >
      <TouchableOpacity
        onPress={props.closeAction}
        style={[msg.messageClose, { backgroundColor: '#F5F5F5', width: 30, height: 32 }]}
      >
        <Icon name={'close'} color={colors.primaryColor} size={18} />
      </TouchableOpacity>

      <View style={modalContainer}>
        <View style={imageModalContainer}>{generate.headerImage(props.modalType)}</View>

        <View style={textModalContainer}>
          <View style={textModalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={textModalStyle}>{generate.headerText(props.modalType)}</Text>
              <Text style={subTextModalStyle}>{generate.headerSubText(props.modalType)}</Text>

              <TextButton
                onPress={() => {
                  props.closeAction();
                  props.navigateAction();
                }}
                title={generate.linkText(props.modalType)}
                color={colors.actionColor}
                size={13}
                style={{ textAlign: 'center', paddingTop: 10 }}
              />
            </View>
          </View>

          <View style={modalButtonContainer}>
            <CheckoutButton
              customText={I18n.t('alertOk')}
              buttonFlex
              onPress={props.buttonAction}
            />
          </View>
        </View>
      </View>
    </KyteModal>
  );
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

const styles = {
  modalContainer: {
    flex: 1,
  },
  imageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  textModalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textModalHeader: {
    flex: 2,
    justifyContent: 'flex-start',
  },
  textModalStyle: [
    Type.Medium,
    Type.fontSize(18),
    colorSet(colors.secondaryBg),
    { paddingHorizontal: SMALL_SCREENS ? 15 : 40, textAlign: 'center', paddingTop: 20 },
  ],
  subTextModalStyle: [
    Type.Regular,
    Type.fontSize(14),
    colorSet(colors.secondaryBg),
    { paddingHorizontal: SMALL_SCREENS ? 15 : 40, textAlign: 'center', paddingTop: 10 },
  ],
  modalButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
};

export { StoreHelpModal };
