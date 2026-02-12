import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { KyteIcon } from '../common';
import { colors, Type } from '../../styles';

const FilterButton = (props) => {
  const { containerStyle, arrowStyle, centralize, titleStyle, arrowRight } = styles;
  return (
    <View style={containerStyle}>
      <TouchableOpacity
        onPress={props.disabledBackwardOnClick ? null : props.backwardOnClick}
        activeOpacity={0.8}
      >
        <View style={[arrowStyle, centralize]}>
          <KyteIcon
            name={'back-navigation'}
            color={props.disabledBackwardOnClick ? colors.lightColor : colors.primaryBg}
            size={13}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={props.disabledTitleOnClick ? null : props.titleOnClick}
        activeOpacity={0.8}
      >
        <View style={[centralize, titleStyle]}>
          <Text style={[Type.Regular, Type.fontSize(14), { color: colors.secondaryBg }]}>
            {props.title}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={props.disabledForwardOnClick ? null : props.forwardOnClick}
        activeOpacity={0.8}
      >
        <View style={[arrowStyle, centralize]}>
          <KyteIcon
            name={'back-navigation'}
            color={props.disabledForwardOnClick ? colors.lightColor : colors.primaryBg}
            size={13}
            style={arrowRight}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  containerStyle: {
    height: 53,
    margin: 15,
    backgroundColor: colors.drawerIcon,
    borderWidth: 1.5,
    borderColor: colors.secondaryBorderColor,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  arrowStyle: {
    width: 50,
    paddingVertical: 10
  },
  arrowRight: {
    transform: [{ rotate: '180deg' }],
  },
  centralize: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleStyle: {
    alignItems: 'center',
    flex: 1,
  },
};

export { FilterButton };
