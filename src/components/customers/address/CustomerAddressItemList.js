import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { KyteIcon } from '../../common';
import { colors, colorSet, Type } from '../../../styles';
import { generateTestID } from '../../../util';

const CustomerAddressItemList = (props) => {
  const { item } = props;
  const { address, subtitle } = item;
  const { container, pinContainer, textContainer, addressText, subtitleText } = styles;

  const renderAddress = () => <Text style={addressText}>{address}</Text>;
  const renderSubtitle = () => <Text style={subtitleText}>{subtitle}</Text>;

  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={container}
      {...generateTestID('address-customer')}
    >
      <View style={pinContainer}>
        <KyteIcon name="pin" size={16} color={colors.secondaryBg} />
      </View>
      <View style={textContainer(subtitle)}>
        {renderAddress()}
        {subtitle ? renderSubtitle() : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
  },
  pinContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: hasSubtitle => ({
      flex: 6,
      paddingVertical: hasSubtitle ? 15 : 25, // Keep card with same height
    }),
  addressText: [
    Type.Medium,
    Type.fontSize(14),
    colorSet(colors.secondaryBg),
  ],
  subtitleText: [
    Type.Regular,
    Type.fontSize(12),
    colorSet(colors.grayBlue),
    { paddingTop: 5 },
  ],
};

export default CustomerAddressItemList;
