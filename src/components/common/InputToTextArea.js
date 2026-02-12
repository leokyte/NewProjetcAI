import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { KyteText } from './';
import { colors } from '../../styles';

const InputToTextArea = (props) => {
  const { placeholder, value, onFocus } = props;

  return (
    <TouchableOpacity onPress={onFocus}>
      {value ? (
        <KyteText size={13} pallete={'grayBlue'} weight={'SemiBold'}>
          {placeholder}
        </KyteText>
      ) : null}
      <View style={styles.inputContainer(value)} {...props.testProps}>
        <KyteText
          pallete={value ? 'primaryBg' : 'grayBlue'}
          size={16}
          numberOfLines={1}
          ellipsizeMode={'tail'}
        >
          {value || placeholder}
        </KyteText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  inputContainer: (hasValue) => ({
    marginVertical: 5,
    paddingVertical: 8,
    borderBottomWidth: 1,
    // borderBottomColor: hasValue ? colors.primaryBg : colors.borderlight,
    borderBottomColor: colors.primaryGrey,
  }),
});

export default React.memo(InputToTextArea);
