import React, { Component } from 'react';
import { FlatList, View, TouchableOpacity, Text } from 'react-native';
import _ from 'lodash';
import emojiRegex from 'emoji-regex'
import { colors, Type } from '../../../styles';
import { generateTestID } from '../../../util';

const regex = emojiRegex();

class ProductCategoryHorizontaList extends Component {
  constructor(props) {
    super(props);
    this.items = [];
    this.itemsName = [];
    this.state = {
      viewableItems: [],
    };
  }

  componentDidMount() {
    this.timer = setTimeout(() => {
      const selectedIndex = _.findIndex(this.props.data, eachItem => {
        return (eachItem.id === this.props.selectedItem);
      });
      this.internalScrollToIndex(selectedIndex);
    }, 100);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selectedItem !== this.props.selectedItem) {
      const selectedIndex = _.findIndex(nextProps.data, eachItem => {
        return (eachItem.id === nextProps.selectedItem);
      });
      this.internalScrollToIndex(selectedIndex);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  onViewableItemsChanged = ({ viewableItems }) => {
    this.setState({ viewableItems });
  };

  onItemPress(item, index) {
    this.props.onPress(item);
    this.internalScrollToIndex(index);
  }

  internalScrollToIndex(index) {
    if (this.props.data.length > 3) {
      if (index === this.props.data.length - 1) {
        if (!this.flatList) {
          return;
        }
        this.flatList.scrollToEnd({ animated: true, index });
        return;
      }
      if (!this.flatList) {
        return;
      }

      if (index === -1) {
        index = 0;
      }

      this.flatList.scrollToIndex({ animated: true, index, viewPosition: 0.5 });
    }
  }

  viewabilityConfig = { viewAreaCoveragePercentThreshold: 99 };

  keyExtractor = (item, index) => index.toString();

  calculateItemOffset(index) {
    let finalWidth = 0;
    for (let i = 0; i < index; i++) {
      if (!this.items[i]) {
        finalWidth += (this.props.data[i].name.length * 10);
        continue;
      }
      finalWidth += this.items[i] || 0;
    }

    return finalWidth;
  }

  renderItem = ({ item, index }) => {
    const { itemContainer, itemText } = styles;
    const selectedItem = this.props.selectedItem === item.id;
    return (
      <TouchableOpacity
        key={index}
        style={itemContainer(selectedItem, item.name.toUpperCase().length, !!regex.exec(item.name.toUpperCase()))}
        onPress={() => this.onItemPress(item, index)}
        onLayout={(event) => { this.items[index] = event.nativeEvent.layout.width; this.itemsName[index] = item.name.toUpperCase(); }}
        activeOpacity={0.8}
      >
        <Text style={[Type.fontSize(14), Type.Medium, itemText(selectedItem)]}>{item.name.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  };

  renderFlatList() {
    return (
      <FlatList
        ref={ref => this.flatList = ref}
        data={this.props.data}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
        {...generateTestID('cat-tab-ck')}
        horizontal
        showsHorizontalScrollIndicator={true}
        extraData={this.props.selectedItem}
        onViewableItemsChanged={this.onViewableItemsChanged}
        viewabilityConfig={this.viewabilityConfig}
        getItemLayout={(data, index) => {
          return { length: this.items[index] || 0, offset: this.calculateItemOffset(index), index };
        }}
      />
    );
  }

  renderStaticList() {
    const renderEachItem = (index, item) => {
      const { itemContainer, itemText } = styles;
      const selectedItem = this.props.selectedItem === item.id;
      return (
        <TouchableOpacity
          key={index}
          style={[itemContainer(selectedItem, item.name.toUpperCase().length), { flex: 1, height: 37 }]}
          onPress={() => this.onItemPress(item, index)}
          onLayout={(event) => { this.items[index] = event.nativeEvent.layout.width; }}
          activeOpacity={0.8}
          {...generateTestID('cat-tab-ck')}
        >
          <Text numberOfLines={1} style={[Type.fontSize(14), Type.Medium, itemText(selectedItem)]}>{item.name.toUpperCase()}</Text>
        </TouchableOpacity>
      );
    };
    return (
      <View style={{ flexDirection: 'row' }} >
        {this.props.data.map((item, index) => { return renderEachItem(index, item); })}
      </View>
    );
  }

  render() {
    return (this.props.data.length > 3 ? this.renderFlatList() : this.renderStaticList());
  }
}

const styles = {
  itemContainer: (selected, textSize) => {
    return {
      backgroundColor: '#FFFFFF',
      borderBottomWidth: selected ? 1.5 : 0,
      borderBottomColor: selected ? colors.actionColor : colors.lightBorder,
      paddingHorizontal: 10,
      minWidth: (textSize * 10),
      alignItems: 'center',
      justifyContent: 'center',
      height: 40
    };
  },
  itemText: (selected) => ({ color: (selected) ? colors.actionColor : colors.disabledColor }),
};

export default ProductCategoryHorizontaList;
