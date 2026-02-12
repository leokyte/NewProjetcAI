import React from 'react';
import { StyleSheet } from 'react-native';
import { colors } from '@kyteapp/kyte-ui-components';
import { KyteModalAlert } from '../../common';


const ShippingFeesTipModal = ({ imageHeightProportion, imageWidth, hideModal, info, image, title, warningText }) => (
    <KyteModalAlert
      titleColor={colors.green01}
      hideModal={hideModal}
      image={image}
      imageWidth={imageWidth}
      imageHeightProportion={imageHeightProportion}
      imageContainerStyle={styles.imageContainerStyle}
      title={title}
      info={info}
      warningText={warningText}
    />
  );

const styles = StyleSheet.create({
  imageContainerStyle: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 15,
    marginRight: 22,
  },
});

export default ShippingFeesTipModal;
