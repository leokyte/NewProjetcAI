import React from 'react';
import { Image, View } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';

import { ActionButton } from '../../../../common';
import NavigationService from '../../../../../services/kyte-navigation';
import I18n from '../../../../../i18n/i18n';
import { colors } from '../../../../../styles';

import { FacebookPixelTipImage } from '../../../../../../assets/images';

const Strings = {
  TITLE_CATALOG_INFO: I18n.t('fbe.infoCatalogTitle'),
  TEXT_CATALOG_INFO: I18n.t('fbe.textCatalogInfo'),
  CATALOG_BUTTON_LABEL: I18n.t('fbe.goToCatalogConfig'),
  FACEBOOK_PIXEL_TIP_INFO: I18n.t('facebookPixelTipInfo'),
};

const renderBottonModalCatalogWarning = () => (
  <>
    <View style={styles.container}>
      <Image source={{ uri: FacebookPixelTipImage(Strings.LANG) }} style={styles.image} />

      <KyteText
        color={colors.primaryDarker}
        size={14.4}
        textAlign="center"
        lineHeight={21.6}
        marginLeft={24}
        marginRight={24}
      >
        {Strings.FACEBOOK_PIXEL_TIP_INFO}
      </KyteText>
    </View>

    <View style={styles.containerFooter}>
      <KyteText
        size={18}
        color={colors.primaryBlack}
        textAlign="center"
        lineHeight={25}
        weight={500}
      >
        {Strings.TITLE_CATALOG_INFO}
      </KyteText>

      <KyteText
        size={14.4}
        color={colors.primaryBlack}
        lineHeight={21}
        textAlign="center"
        marginTop={4}
        marginBottom={15}
        marginLeft={20}
        marginRight={20}
      >
        {Strings.TEXT_CATALOG_INFO}
      </KyteText>

      <ActionButton
        onPress={() => NavigationService.navigate('OnlineCatalog', 'CatalogConfigIndex')}
        style={styles.buttonCatalog}
        textStyle={styles.textButtonCatalog}
      >
        {Strings.CATALOG_BUTTON_LABEL}
      </ActionButton>
    </View>
  </>
);

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    height: 206,
    width: 300,
    alignSelf: 'center',
  },
  containerFooter: {
    width: '100%',
    backgroundColor: colors.white,
    zIndex: 1,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.littleDarkGray,
  },
  buttonCatalog: {
    marginBottom: 16,
  },
  textButtonCatalog: {
    color: colors.white,
    fontSize: 16,
  },
};

export default renderBottonModalCatalogWarning;
