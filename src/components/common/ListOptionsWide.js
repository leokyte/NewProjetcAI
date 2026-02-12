import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { KyteIcon, KyteText } from './';
import { Type, colors, colorSet } from '../../styles';
import { generateTestID } from '../../util/qa/qa-utils';

const ListOptionsWide = (props) => {
  const { items, reverseColor, titleStyle } = props;

  const renderIcon = (icon) => (
    <View style={style.iconContainer}>
      <KyteIcon name={icon.icon} color={icon.color} size={20} />
    </View>
  );

  const renderBadge = (badge) => (
    <View style={style.badgeContainer(badge.color)}>
      <Text style={[Type.SemiBold, { color: badge.color || 'white', fontSize: 8 }]}>
        {badge.label}
      </Text>
    </View>
  );

  const renderSubtitle = (subtitle) => (
    <KyteText weight={'Medium'} size={9} style={{ color: '#808C9E', marginTop: 5 }}>
      {subtitle.toUpperCase()}
    </KyteText>
  );

  const renderItems = () =>
    items.map((item, i) => {
      return (
        <TouchableOpacity
          onPress={!item.disabled ? item.onPress : null}
          key={i}
          style={style.itemContainer(item.badge)}
          {...generateTestID(`${item.title}-sr`)}
        >
          {item.badge ? renderBadge(item.badge) : null}
          {item.icon ? renderIcon(item.icon) : null}
          <Text
            style={[
              Type.Medium,
              Type.fontSize(15),
              colorSet(reverseColor ? '#FFF' : item.color || colors.primaryColor),
              style.title,
              titleStyle,
            ]}
          >
            {item.title}
          </Text>
          {item.subtitle ? renderSubtitle(item.subtitle) : null}
        </TouchableOpacity>
      );
    });

  return <View style={style.mainContainer(reverseColor)}>{renderItems()}</View>;
};

const style = {
  mainContainer: (reverseColor) => {
    return {
      flexDirection: 'row',
      backgroundColor: reverseColor ? colors.primaryDarker : null,
    };
  },
  itemContainer: (badge) => {
    return {
      flex: 1,
      paddingTop: badge ? 25 : 15,
      paddingBottom: 15,
      paddingHorizontal: 5,
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: colors.primaryColor,
    };
  },
  iconContainer: {
    marginBottom: 15,
  },
  title: {
    textAlign: 'center',
  },
  badgeContainer: (borderColor = 'white') => {
    return {
      position: 'absolute',
      top: 5,
      right: 5,
      paddingVertical: 1,
      paddingHorizontal: 5,
      borderWidth: 2,
      borderRadius: 2,
      borderColor,
    };
  },
};

export { ListOptionsWide };
