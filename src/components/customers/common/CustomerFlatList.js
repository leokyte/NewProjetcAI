import React, { PureComponent } from 'react';
import { FlatList, View } from 'react-native';
import CustomerAddressItemList from '../address/CustomerAddressItemList';
import CustomerImportItemList from '../import/CustomerImportItemList';

import { colors } from '../../../styles/index';

class CustomerFlatList extends PureComponent {
  keyExtractor = (item, index) => index.toString();

  renderItem = (type, item, index) => {
    switch (type) {
      default:
        return (
          <CustomerAddressItemList
            key={index}
            onPress={() => this.props.onPress(item)}
            item={item}
          />
        );
      case 'contacts':
        return (
          <CustomerImportItemList
            key={index}
            onPress={() => this.props.onPress(item)}
            contact={item}
          />
        );
    }
  };

  renderSeparator() {
    return (<View style={styles.separator} />);
  }

  render() {
    const { data, type } = this.props;
    return (
      <FlatList
        data={data}
        renderItem={({ item, index }) => this.renderItem(type, item, index)}
        keyExtractor={this.keyExtractor}
        ItemSeparatorComponent={this.renderSeparator}
      />
    );
  }
}

const styles = {
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderlight,
  }
};

export default CustomerFlatList;
