import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { colors, Type, colorSet } from '../../../styles/index';

const CustomerImportItemList = (props) => {
  const { container, checkBoxContainer, textContainer, nameText, subtitleText, checkStyles } = styles;
  const { contact } = props;

  const renderInfos = () => {
    const { email, celPhone, phone } = contact;
    let info;
    if (email && !celPhone && !phone) {
      info = email;
    } else if (email && celPhone && !phone) {
      info = `${email} - ${celPhone}`;
    } else if (email && celPhone && phone) {
      info = `${email} - ${celPhone} - ${phone}`;
    } else if (!email && !celPhone && phone) {
      info = phone;
    } else if (!email && celPhone && phone) {
      info = `${celPhone} - ${phone}`;
    } else if (!email && celPhone && !phone) {
      info = celPhone;
    } else if (email && !celPhone && phone) {
      info = `${email} - ${phone}`;
    }

    return (
      <View style={textContainer}>
        <Text style={nameText}>
          {contact.name}
        </Text>
        {info ? (<Text style={subtitleText}>{info}</Text>) : null}
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={props.onPress}
      activeOpacity={0.8}
      style={container}
    >
      <View style={checkBoxContainer}>
        <CheckBox
          containerStyle={checkStyles}
          checkedIcon={'check-box'}
          uncheckedIcon={'check-box-outline-blank'}
          iconType={'material'}
          onPress={props.onPress}
          checkedColor={colors.actionColor}
          checked={contact.selected}
        />
      </View>
      {renderInfos()}
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 20
  },
  checkBoxContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textContainer: {
    flex: 6,
    paddingVertical: 15
  },
  nameText: [
    Type.Medium,
    Type.fontSize(14),
    colorSet(colors.secondaryBg)
  ],
  subtitleText: [
    Type.Regular,
    Type.fontSize(12),
    colorSet(colors.grayBlue),
    { paddingTop: 5 }
  ],
  checkStyles: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0
  },
};

export default CustomerImportItemList;
