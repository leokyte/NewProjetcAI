import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors, Type } from '../../styles';
import { KyteIcon } from './';

const EmptyContent = (props) => {
  const { contentAlign, createBox, info } = styles;
  const renderAddIcon = () => {
    return <Icon name={'add'} color={colors.actionColor} size={60} />;
  };

  const renderCustomIcon = () => {
    return <KyteIcon color={props.color} name={props.icon} size={80} />;
  };

  return (
    <View style={contentAlign}>
      {props.noIconRender ? null : (
        <View>
          {props.topContent}
          <TouchableOpacity onPress={props.onPress} activeOpacity={0.8}>
            <View style={createBox}>{props.icon ? renderCustomIcon() : renderAddIcon()}</View>
          </TouchableOpacity>
        </View>
      )}
      <Text allowFontScaling={false} style={[info, Type.Regular]}>
        {props.text}
      </Text>
      {props.bottomContent}
    </View>
  );
};

const styles = {
  contentAlign: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  createBox: {
    width: 120,
    height: 120,
    borderRadius: 6,
    backgroundColor: colors.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    marginTop: 15,
    color: colors.primaryColor,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
  },
};

export { EmptyContent };
