import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { KyteSwitch } from '@kyteapp/kyte-ui-components';
import { SwitchContainer } from ".";
import { colors, Type } from '../../styles';

const SwitchContainer2 = (props) => {
  // Refatorar para o switch receber as testProps
  const { title, description, disabled = false, value, onPressAction, titleStyle } = props;
  return (
    <SwitchContainer
      title={title}
      titleStyle={titleStyle || [Type.SemiBold, styles.titleStyle]}
      description={description}
      descriptionStyle={[Type.Regular, styles.descriptionStyle(disabled)]}
      onPress={() => onPressAction(!value)}
    >
      <KyteSwitch
        onValueChange={onPressAction}
        active={value}
        disabled={disabled}
      />
    </SwitchContainer>
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    color: colors.secondaryBg,
    fontSize: 14,
  },
  descriptionStyle: (disabled) => ({
    color: disabled ? colors.grayBlue : colors.primaryBg,
    fontSize: 12,
    lineHeight: (Platform.OS === 'ios') ? 16 : 20,
    paddingRight: 90,
  }),
});

export default React.memo(SwitchContainer2);
