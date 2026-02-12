import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { KyteIcon, KyteText } from './';
import { colors } from '../../styles';

const Capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const CheckBoxOption = (props) => (
  <TouchableOpacity onPress={() => props.onPress(props.item)}>
    <View style={styles.container}>
      <View style={styles.box}>
        <View style={styles.boxInner(props.active)} />
      </View>
      <KyteText style={styles.label} size={14}>{Capitalize(props.label)}</KyteText>
      {props.icon ?
        <View style={styles.iconContainer(props.iconsSize)}>
          <KyteIcon size={props.icon.size || 16} name={props.icon.name} color={props.icon.color} />
        </View>
      : null}
    </View>
  </TouchableOpacity>
);

const boxSize = 15;

const styles = {
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    height: 50,
    alignItems: 'center',
  },
  label: {
    flex: 1,
    paddingLeft: 20,
  },
  box: {
    borderWidth: 2,
    borderColor: colors.borderColor,
    borderRadius: 6,
  },
  boxInner: (active) => ({
    width: (boxSize - 2),
    height: (boxSize - 2),
    margin: 2,
    borderRadius: 4,
    backgroundColor: active ? colors.actionColor : 'white',
  }),
  iconContainer: (width = 'auto') => ( {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  }),
};

export { CheckBoxOption };
