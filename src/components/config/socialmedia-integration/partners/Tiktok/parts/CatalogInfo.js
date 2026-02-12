import React from 'react';
import { View } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';

import { ActionButton } from './../../../../../common';
import { colors } from './../../../../../../styles';

export const CatalogInfo = ({ text, label, title, navigate }) => {
  return (
    <View style={styles.containerFooter}>
      <KyteText
        size={18}
        color={colors.primaryBlack}
        textAlign="center"
        lineHeight={25}
        weight={500}
      >
        {title}
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
        {text}
      </KyteText>

      <ActionButton
        onPress={navigate}
        style={styles.buttonCatalog}
        textStyle={styles.textButtonCatalog}
      >
        {label}
      </ActionButton>
    </View>
  );
};

const styles = {
  containerHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  imgHeader: {
    width: 320,
    height: 180,
  },
  socialNetworks: {
    width: 193,
    height: 47,
    marginBottom: 22,
    marginTop: 7,
  },
  containerFooter: {
    width: '100%',
    backgroundColor: colors.white,
    zIndex: 1,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.littleDarkGray,
  },
  tutorialButton: {
    marginBottom: 7,
  },
  buttonCatalog: {
    marginBottom: 16,
  },
  textButtonCatalog: {
    color: colors.white,
    fontSize: 16,
  },
  textButtonOutline: {
    color: colors.secondaryGrey,
    fontSize: 14,
  },
  textButtonFacebook: {
    fontSize: 14,
  },
};
