import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { connect } from 'react-redux';
import HeaderButton from './HeaderButton';
import { showOfflineAlert } from '../../util';
import { colors, colorSet, drawerStyles, Type } from '../../styles';

const DrawerLabelComponent = (props) => {
  const checkInternet = () => {
    if (props.isOnline) return props.navigation.navigate(props.needInternet);
    showOfflineAlert();
  };

  const renderBadge = () => {
    const { badge, badgeText } = drawerStyles;

    return (
      <View style={badge}>
        <Text style={badgeText}>{props.badge.toUpperCase()}</Text>
      </View>
    );
  };

  const renderIcon = (icon, notificate, size) => {
    const { iconSize } = drawerStyles;
    const { navigation } = props;
    const isFocused = navigation.isFocused && navigation.isFocused();
    // const hasUnreadMessages = props.numberOfUnreadMessages > 0;

    return (
      <HeaderButton
        buttonKyteIcon
        buttonNotification={notificate}
        icon={icon}
        size={size || iconSize}
        color={isFocused ? 'white' : colors.grayBlue}
      />
    );
  };

  const renderQuantity = (quantity) => {
    return (
      <View style={styles.buttonContainer}>
        <View style={styles.roundedButton}>
          <Text style={[Type.Medium, Type.fontSize(11), colorSet('#444e5e')]}>{quantity}</Text>
        </View>
      </View>
    );
  };

  const menuLabel = () => {
    const { labelStyle, labelContainer, labelInner, iconSize } = drawerStyles;
    const { label, badge, icon, notificate } = props;
    const quantity = props.openedSalesQuantity;
    const size = icon === 'dollar-sign' ? iconSize + 2 : iconSize;
    // navigation.isFocused && navigation.isFocused() ? iconSelected : icon
    // const { label, badge, icon, iconSelected, notificate, navigation } = props;

    return (
      <View style={labelContainer}>
        {icon ? renderIcon(icon, notificate, size) : renderQuantity(quantity)}
        <View style={labelInner}>
          <Text style={labelStyle}>{label}</Text>
          {badge ? renderBadge() : null}
        </View>
      </View>
    );
  };

  const customLabel = () => {
    const { labelStyle, labelContainer, iconSize } = drawerStyles;
    return (
      <TouchableOpacity
        onPress={props.needInternet ? () => checkInternet() : props.onPress}
        activeOpacity={0.8}
      >
        <View style={labelContainer}>
          <HeaderButton
            buttonKyteIcon
            buttonNotification={props.notificate}
            icon={props.icon}
            size={iconSize}
            color={colors.grayBlue}
          />
          <Text style={labelStyle}>{props.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return props.onPress || props.needInternet ? customLabel() : menuLabel();
};

const styles = {
  buttonContainer: {
    padding: 0,
    height: '100%',
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  roundedButton: {
    backgroundColor: colors.actionColor,
    borderRadius: 50,
    width: 24,
    height: 18,
    alignItems: 'center',
    ...Platform.select({ ios: { justifyContent: 'center' } }),
  },
};

const mapStateToProps = (state) => ({
  openedSalesQuantity: state.sales.openedSalesQuantity,
  confirmedOrdersQuantity: state.sales.confirmedOrdersQuantity,
  isOnline: state.offline.online,
});

const DrawerLabel = connect(mapStateToProps)(DrawerLabelComponent);

export { DrawerLabel };
