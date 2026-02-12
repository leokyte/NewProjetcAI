import React from 'react';
import { View, ScrollView } from 'react-native';
import { CheckBoxOption } from '../common';
import { colors } from '../../styles';

const listContainer = { maxHeight: 400 };
//icon={{ name: iconName(s.status), color: s.color, size: s.status === paid ? 20 : 16 }}

const SellersFilter = (props) => (
  <View style={listContainer}>
    <ScrollView>
      {props.sellers.map((u, i) => (
        <CheckBoxOption
          key={i}
          item={u}
          onPress={u.onPress || props.onPress}
          label={u.displayName}
          icon={u.uid === 'catalog' ? { name: 'cart', color: colors.primaryColor, size: 20 } : null}
          active={props.selectedUsers.find(selected => u.uid === selected.uid) || (u.uid === 'catalog' && props.catalog)}
        />
      ))}
    </ScrollView>
  </View>
);

export default SellersFilter;
