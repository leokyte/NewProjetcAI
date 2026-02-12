import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import CustomerItemList from './CustomerItemList';
import CustomerImportItemList from '../import/CustomerImportItemList';
import { generateTestID } from '../../../util';

class CustomerList extends PureComponent {
  keyExtractor = (item) => item.id.toString();
  

  renderItem = ({ item }) => {
    return (
      <CustomerItemList
        key={item.id}
        onPress={() => this.props.onPress(item)}
        customer={item}
        disableOptions={this.props.disableOptions}
      />
    );
  };

  renderAnotherItem = ({ item }) => {
    return (
      <CustomerImportItemList
        key={item.id}
        onPress={() => this.props.onPress(item)}
        contact={item}
      />
    );
  };

  render() {
    const { data, emptyComponent, type } = this.props;

    return (
      <FlatList
        contentContainerStyle={data.length > 0 ? null : styles.container}
        data={data}
        renderItem={type && type === 'contacts' ? this.renderAnotherItem : this.renderItem}
        keyExtractor={this.keyExtractor}
        ListEmptyComponent={emptyComponent}
        {...generateTestID('cust-list-csr')}
      />
    );
  }
}

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default CustomerList;
