import React from 'react';
import { View, Text } from 'react-native';
import I18n from '../../../../i18n/i18n';
import { colors, colorSet, Type } from '../../../../styles';

const InputSection = ({ title, required, disabled, instructions, inputContainer }) => {
  const {
    section,
    sectionTitle,
    sectionTitleContainer,
    sectionRequiredContainer,
    sectionInstructions,
  } = styles;
  return (
    <View style={section}>
      <View style={sectionTitle}>
        <View style={sectionTitleContainer}>
          <Text
            style={[
              Type.Medium,
              Type.fontSize(14),
              colorSet(colors.secondaryBg),
              { opacity: disabled ? 0.4 : 1 },
            ]}
          >
            {title}
          </Text>
        </View>

        <View style={sectionRequiredContainer}>
          <Text
            style={[
              Type.Regular,
              Type.fontSize(12),
              colorSet(colors.grayBlue),
              { opacity: disabled ? 0.4 : 1 },
            ]}
          >
            ({required ? I18n.t('words.s.required') : I18n.t('words.s.optional')})
          </Text>
        </View>
      </View>

      {inputContainer()}

      {instructions ? (
        <View style={sectionInstructions}>
          <Text
            style={[
              Type.Regular,
              Type.fontSize(12),
              colorSet(colors.primaryBg),
              { lineHeight: 16 },
            ]}
          >
            {instructions}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = {
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    flex: 1,
  },
  sectionTitle: {
    flexDirection: 'row',
    paddingTop: 20,
  },
  sectionTitleContainer: {
    paddingHorizontal: 20,
    flex: 2,
    alignItems: 'flex-start',
  },
  sectionRequiredContainer: {
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'flex-end',
  },
  sectionFieldContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 20,
  },
  sectionInstructions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    // paddingTop: 20
  },
};

export default InputSection;
