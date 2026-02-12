import React from 'react';
import { Image, View } from 'react-native';
import { KyteIcon, KyteText } from '@kyteapp/kyte-ui-components';

import I18n from '../../../../../i18n/i18n';

import { colors } from '../../../../../styles';

const Strings = {
  TITLE_POSSIBILITIES_INTEGRATION_1: I18n.t('fbe.integrationPossibilitiesText1'),
  TITLE_POSSIBILITIES_INTEGRATION_2: I18n.t('fbe.integrationPossibilitiesText2'),
  TITLE_POSSIBILITIES_INTEGRATION_3: I18n.t('fbe.integrationPossibilitiesText3'),
  TITLE_POSSIBILITIES_INTEGRATION_4: I18n.t('fbe.integrationPossibilitiesText4'),
  TITLE_POSSIBILITIES_INTEGRATION_5: I18n.t('fbe.integrationPossibilitiesText5'),
};

const renderBox = (title, subtitle, image, styleImage, index) => {
  return (
    <View key={index} style={[styles.box, { marginBottom: index === 1 ? 50 : 40 }]}>
      <View style={styles.iconCheck}>
        <KyteIcon
          name={'check-inner'}
          size={26}
          color={colors.actionColor}
          style={styles.iconStyle}
        />
      </View>

      <View style={[styles.headerText, { marginBottom: index === 2 ? 8 : 16 }]}>
        <KyteText size={18} weight={600} color={colors.primaryBlack} textAlign="center">
          {title}
        </KyteText>

        <KyteText
          size={18}
          color={colors.primaryBlack}
          lineHeight={25}
          textAlign="center"
          marginLeft={30}
          marginRight={30}
        >
          {subtitle}
        </KyteText>
      </View>

      {image ? (
        <Image source={{ uri: image }} style={styleImage} resizeMode="contain" />
      ) : (
        <KyteText
          size={14.4}
          color={colors.primaryBlack}
          lineHeight={21}
          textAlign="center"
          marginLeft={20}
          marginRight={20}
        >
          {Strings.TITLE_POSSIBILITIES_INTEGRATION_1}{' '}
          <KyteText weight={600} size={14} color={colors.primaryBlack}>
            {Strings.TITLE_POSSIBILITIES_INTEGRATION_2}{' '}
          </KyteText>
          {Strings.TITLE_POSSIBILITIES_INTEGRATION_3}{' '}
          <KyteText weight={600} size={14} color={colors.primaryBlack}>
            {Strings.TITLE_POSSIBILITIES_INTEGRATION_4}{' '}
          </KyteText>
          {Strings.TITLE_POSSIBILITIES_INTEGRATION_5}
        </KyteText>
      )}
    </View>
  );
};

const styles = {
  box: {
    backgroundColor: colors.borderlight,
    width: '95%',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingBottom: 23,
  },
  iconCheck: {
    width: 48,
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    borderColor: colors.borderlight,
    borderWidth: 1.5,
  },
  iconStyle: {
    marginLeft: -5,
    marginTop: 10,
  },
  headerText: {
    alignItems: 'center',
    marginVertical: 16,
  },
};

export default renderBox;
