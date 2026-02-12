import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { KyteButton, KyteIcon } from './';
import { colors } from '../../styles';

const renderCheck = (disabled) => (
  <View>
    <KyteIcon size={16} name='check' color={disabled ? colors.lightBorder : colors.actionColor} />
  </View>
);

const renderTipButton = (option) => (
  <KyteButton height={26} onPress={option.onPress} style={styles.iconHelpFilled}>
    <KyteIcon name={'help-filled'} size={16} color={colors.grayBlue} />
  </KyteButton>
);

const CheckList = (props) => {
  return props.options.map((option, i) => (
    <TouchableOpacity
      key={i}
      onPress={() => props.onPress(i)}
      activeOpacity={props.disabled ? 1 : 0.8}
    >
      <View style={styles.checkListContainer(props.noPaddingHorizontal)}>
        <View style={styles.textContainer}>
          <Text style={[styles.checkText, { opacity: props.disabled ? 0.4 : 1 }]}>
            {option.description}
          </Text>
          {option.tip ? renderTipButton(option) : null}
        </View>
        {props.selected === i ? renderCheck(props.disabled) : null}
      </View>
    </TouchableOpacity>
  ));
};

const styles = {
  checkListContainer: (noPaddingHorizontal = false) => {
    return {
      flexDirection: 'row',
      paddingVertical: 15,
      paddingHorizontal: noPaddingHorizontal ? 0 : 20,
      borderBottomWidth: 1,
      borderColor: colors.borderColor,
    };
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  iconHelpFilled: {
    marginLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 16,
    fontFamily: 'Graphik-Regular',
    color: colors.primaryColor,
  },
};

export { CheckList };
