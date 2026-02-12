import React from 'react';
import { CheckBox } from 'react-native-elements';
import { View } from 'react-native';
import { colors } from '../../styles';

const CheckItem = (props) => {
  return (
    <View>
      <CheckBox
        containerStyle={[style, props.containerStyle]}
        fontFamily={'Graphik-Regular'}
        textStyle={[{ fontSize: 14, fontWeight: '400' }, props.textStyle]}
        title={props.title}
        checkedIcon={'check-box'}
        uncheckedIcon={'check-box-outline-blank'}
        iconType={'material'}
        onPress={() => props.onPress()}
        checked={props.checked}
        checkedColor={colors.actionColor}
        testProps={props.testProps}
        {...props.testProps}
      />
    </View>
  );
};

const style = {
  padding: 0,
  marginLeft: 0,
  marginRight: 0,
  backgroundColor: 'transparent',
  borderWidth: 0,
};

export { CheckItem };
