import React from 'react';
import { View } from 'react-native';
import { KyteText } from ".";
import { colors } from '../../styles';

const KyteSection = ({ title, subtitle, titleSpacing, children }) => (
  <View style={styles.section}>
    {title ?
      <View style={styles.sectionTitle(titleSpacing)}>
          <KyteText uppercase weight="Medium" pallete="grayBlue">{title}</KyteText>
          {subtitle ?
            <View style={styles.subtitle}>
              <KyteText pallete="grayBlue">{subtitle}</KyteText>
            </View>
          : null}
        </View>
      : null}
    {children}
  </View>
);

const styles = {
  section: {
    borderBottomWidth: 15,
    borderColor: colors.borderColor,
  },
  sectionTitle: (padding = 20) => ({
    padding,
  }),
  subtitle: {
    marginTop: 10,
  },
};

export { KyteSection };
