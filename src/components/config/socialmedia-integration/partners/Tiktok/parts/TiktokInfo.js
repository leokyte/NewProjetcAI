import React from 'react';
import { View, FlatList } from 'react-native';
import { KyteIcon, KyteText } from '@kyteapp/kyte-ui-components';

import I18n from './../../../../../../i18n/i18n';
import { colors } from './../../../../../../styles';

export const TiktokInfo = () => {
  const contentList = [I18n.t('tiktok.info_1'), I18n.t('tiktok.info_2'), I18n.t('tiktok.info_3')];

  return (
    <View style={styles.contentItem}>
      <FlatList
        keyExtractor={(_, index) => index.toString()}
        data={contentList}
        renderItem={({ item, index }) => (
          <View style={[styles.icon, { marginTop: index > 0 ? 32 : 0 }]}>
            <View style={styles.text}>
              <KyteIcon name="arrow-cart" color={colors.white} size={11} />
            </View>
            <View style={styles.alignText}>
              <KyteText size={18} weight={400} color={colors.primaryBlack} lineHeight={29}>
                {item}
              </KyteText>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = {
  contentItem: {
    paddingHorizontal: 25,
    paddingVertical: 32,
  },
  icon: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    backgroundColor: colors.tipColor,
    height: 40,
    width: 40,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alignText: {
    flex: 1,
    alignItems: 'flex-start',
  },
};
