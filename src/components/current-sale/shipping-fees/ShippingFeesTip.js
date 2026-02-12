import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { DetailPage, CenterContent, ActionButton, KyteText } from '../../common';
import I18n from '../../../i18n/i18n';
import { ShippingFeesTipImage } from '../../../../assets/images';
import { StackActions, useNavigationState } from '@react-navigation/native';

const Strings = {
  t_page_title: I18n.t('ShippingFees.PageTitle'),
  t_info: I18n.t('ShippingFees.TipModalInfo'),
  t_button_label: I18n.t('ShippingFees.CreateNewShippingFee'),
};

const ShippingFeesTip = ({ navigation }) => {
  const navigationKey = useNavigationState(({ key }) => key);

  const goToShippingFees = () => {
    navigation.dispatch({
      ...StackActions.replace('ShippingFees'),
      source: 'ShippingFeesTipPage',
      target: navigationKey,
    });
  };

  //
  // Render
  //

  const imageWidth = 185;
  const renderImage = () => (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: ShippingFeesTipImage }}
        style={{
          width: imageWidth,
          height: imageWidth * 0.5,
        }}
      />
    </View>
  );

  const renderInfo = () => (
    <View style={styles.infoContainer}>
      <KyteText
        pallete={'secondaryBg'}
        size={16}
        lineHeight={24}
        textAlign={'center'}
      >
        {`${Strings.t_info.pt1}\n\n${Strings.t_info.pt2}`}
      </KyteText>
    </View>
  );

  const renderButton = () => (
    <View style={styles.buttonContainer}>
      <ActionButton
        onPress={goToShippingFees}
      >
        {Strings.t_button_label}
      </ActionButton>
    </View>
  );

  return (
    <DetailPage
      pageTitle={Strings.t_page_title}
      goBack={navigation.goBack}
    >
      <CenterContent>
        {renderImage()}
        {renderInfo()}
      </CenterContent>
      {renderButton()}
    </DetailPage>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    marginBottom: 45,
    paddingRight: 30,
  },
  infoContainer: {
    paddingHorizontal: 25,
  },
  buttonContainer: {
    paddingVertical: 15,
  },
});

export default ShippingFeesTip;
