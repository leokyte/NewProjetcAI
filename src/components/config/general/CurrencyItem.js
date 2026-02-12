import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { imgUrl } from '../../../util';
import { colors } from '../../../styles';

const imageURL = (countryCode) => `${imgUrl}/.countries%2F${countryCode}.png?alt=media`;

const CurrencyItem = (props) => {
  const { countryListItem, countryImg, countryContent, countryCode, currencyName, image } = styles;
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={countryListItem}>
        <View style={countryImg}>
          <Image style={image} source={{ uri: imageURL(props.code.toLowerCase()) }} />
        </View>
        <View style={countryContent}>
          <Text style={countryCode}>{props.code}</Text>
          <Text style={currencyName}>{props.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  countryListItem: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.borderColor,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  countryImg: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCode: {
    fontFamily: 'Graphik-Regular',
    fontSize: 18,
    color: colors.primaryColor,
    paddingVertical: 3,
  },
  currencyName: {
    fontFamily: 'Graphik-Regular',
    fontSize: 11,
    color: colors.primaryColor,
    paddingVertical: 3,
  },
  image: {
    resizeMode: 'contain',
    width: 50,
    height: 20,
  },
};

export default CurrencyItem;
