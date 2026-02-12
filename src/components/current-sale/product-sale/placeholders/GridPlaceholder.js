import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { gridStyles, gridItemDefaults, colors } from '../../../../styles';
import { KyteIcon } from '../../../common';

const GridPlaceholder = (props) => {
  const useActionCta = props.item.first && props.hasNoProduct;

  const { itemContainer, addItem, addItemIcon } = gridStyles;

  const { addIconSize, addIconColor, addIconName } = props;

  const renderIcon = () => {
    if (props.item.first) {
      if (props.useKyteIcon) {
        return (
          <KyteIcon
            size={addIconSize || addItemIcon().size}
            name={addIconName || 'plus'}
            color={addIconColor || addItemIcon(useActionCta ? '#FFF' : '').color}
          />
        );
      }

      return (
        <Icon
          name="add"
          size={addIconSize || addItemIcon().size}
          color={addIconColor || addItemIcon(useActionCta ? '#FFF' : '').color}
        />
      );
    }
  };
  return (
    <View style={[itemContainer, props.style]}>
      <TouchableOpacity onPress={props.onPress} activeOpacity={0.8}>
        <View
          style={[
            addItem(useActionCta ? colors.actionColor : ''),
            gridItemDefaults,
            props.iconContainerStyle,
          ]}
        >
          {renderIcon()}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default GridPlaceholder;
