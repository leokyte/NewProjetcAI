import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { salesSetExpandedItems } from '../../stores/actions';
import { KyteIcon } from './';
import { colors } from '../../styles';

const C = (props) => {
  const expandedItems = props.expandedItems;
  const rowCenterStyle = { flexDirection: 'row', alignItems: 'center' };
  const changeListView = () => props.salesSetExpandedItems(!expandedItems, props.salesType);

  return (
    <TouchableOpacity onPress={() => changeListView()} style={{ padding: 5 }}>
      <View style={rowCenterStyle}>
        <KyteIcon
          name={'screen-small'}
          color={expandedItems ? colors.lightColor : colors.secondaryBg}
          size={10}
          style={{ marginRight: 4 }}
        />
        <KyteIcon
          name={'screen-big'}
          color={expandedItems ? colors.secondaryBg : colors.lightColor}
          size={18}
        />
      </View>
    </TouchableOpacity>
  );
};
const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators({
    salesSetExpandedItems,
  }, dispatch),
});
const SwicthExpandSales = connect(null, mapDispatchToProps)(C);
export { SwicthExpandSales };
