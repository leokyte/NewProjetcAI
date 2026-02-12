import React, { Component } from 'react';
import { View, Alert, FlatList, InteractionManager } from 'react-native';
import { connect } from 'react-redux';

import DraggableFlatList from 'react-native-draggable-flatlist';
import ProductCategoryItemList from './ProductCategoryItemList';
import { EmptyContent, SearchBar, KyteSafeAreaView } from '../../common';
import { scaffolding } from '../../../styles';
import {
  checkUserReachedLimit,
  productCategoryDetailCreate,
  productCategoryDetailUpdate,
  productCategoryFetch,
  productCategoryFetchByName,
  productCategorySave,
  productCategoryReorder,
} from '../../../stores/actions';
import I18n from '../../../i18n/i18n';
import NavigationService from '../../../services/kyte-navigation';
import { checkUserPermission } from '../../../util';
import { logEvent } from '../../../integrations/Firebase-Integration';

class ProductCategoryList extends Component {
  static navigationOptions = () => {
    return { tabBarLabel: I18n.t('productsTabCategoriesLabel') };
  };

  constructor(props) {
    super(props);

    this.state = {
      hasCategories: false,
      didFinishInitialAnimation: false,
    };
  }

  componentDidMount() {
    logEvent('Product Category List View')
    this.props.productCategoryFetch(null, (data) => {
      const allCategories = new Map();
      for (const category of this.props.productCategory) {
        allCategories.set(category.name, category);
      }

      this.setState({ allCategories, hasCategories: !!data.length });
    });

    InteractionManager.runAfterInteractions(() => {
      this.setState({
        didFinishInitialAnimation: true,
      });
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ hasCategories: !!nextProps.productCategory.length });
  }

  goToProductCategory(productCategory) {
    const { permissions } = this.props.user;
    const { navigate } = this.props.navigation;
    const { origin } = this.props;

    if (checkUserPermission(permissions).allowProductsRegister) {
      if (origin && origin === 'ProductDetail') {
        this.props.onItemPress(productCategory);
      } else {
        this.props.productCategoryDetailUpdate(productCategory);
        navigate('ProductCategoryCreate');
      }
      return;
    }

    Alert.alert(I18n.t('words.s.attention'), I18n.t('userNotAllowedToManageProducts'));
  }

  toggleSearch() {
    const { isSearchBarVisible } = this.state;
    this.setState({ isSearchBarVisible: !isSearchBarVisible });
  }

  closeSearch() {
    this.setState({ isSearchBarVisible: false });
    this.searchCategoriesByName('');
  }

  openProductCategoryCreate() {
    const { navigation, user, userHasReachedLimit } = this.props;
    const { navigate } = navigation;
    const { permissions } = user;

    this.props.checkUserReachedLimit();
    if (userHasReachedLimit) {
      NavigationService.reset('Confirmation', 'SendCode', {
        origin: 'user-blocked',
        previousScreen: 'Products',
      });

      logEvent('UserReachedLimit', user);
      return;
    }

    if (checkUserPermission(permissions).allowProductsRegister) {
      const { origin, onAddPress } = this.props;
      this.props.productCategoryDetailCreate();
      if (origin === 'ProductDetail' && onAddPress) {
        return onAddPress();
      }
      navigate('ProductCategoryCreate');
      return;
    }

    Alert.alert(I18n.t('words.s.attention'), I18n.t('userNotAllowedToManageProducts'));
  }

  searchCategoriesByName(text) {
    this.props.productCategoryFetchByName(text);
  }

  async updateCategoryOrder(newOrder) {
    const { allCategories } = this.state;

    const updatedCategories = [];
    let index = 0;
    for (const _category of newOrder) {
      if (index !== allCategories.get(_category.name).order) {
        allCategories.delete(_category.name);

        // realm workaround for spread operator
        let category;
        try {
          category = _category.clone();
        } catch (ex) {
          category = _category;
        }

        allCategories.set(category.name, { ...category, order: index });
        updatedCategories.push({ ...category, order: index });
      }
      index++;
    }

    await this.props.productCategoryReorder(updatedCategories);
    this.props.productCategoryFetch();
  }

  renderItem = ({ item, drag, isActive, index }) => {
    const { disableDraggable } = this.props;
    return (
      <ProductCategoryItemList
        key={index}
        onPress={() => this.goToProductCategory(item)}
        productCategory={item}
        disabled={isActive}
        onLongPress={!disableDraggable ? drag : null}
        isActive={!disableDraggable ? isActive : null}
      />
    );
  };

  renderEmptyContent() {
    return (
      <EmptyContent
        onPress={() => this.openProductCategoryCreate()}
        text={I18n.t('firstItemCategoryHelper')}
      />
    );
  }

  renderContent() {
    const { productCategory, origin } = this.props;
    const { didFinishInitialAnimation } = this.state;
    const finalProductCategory =
      origin && origin === 'ProductDetail'
        ? [{ name: I18n.t('productCategoryWithoutCategory'), id: null }].concat(productCategory)
        : productCategory;

    const extractKey = (item, index) => `draggable-item-${index}`;
    const handleDragEnd = ({ data }) => this.updateCategoryOrder(data);
    const itemLayout = (data, index) => ({ length: 392.7, offset: 65.5 * index, index });

    const renderDraggable = () => {
      return (
        didFinishInitialAnimation && (
          <DraggableFlatList
            containerStyle={styles.DraggableListStyle}
            data={finalProductCategory}
            renderItem={this.renderItem}
            keyExtractor={extractKey}
            onDragEnd={handleDragEnd}
            maxToRenderPerBatch={30}
            initialNumToRender={12}
            updateCellsBatchingPeriod={70}
            windowSize={31}
            getItemLayout={itemLayout}
            autoscrollSpeed={10}
          />
        )
      );
    };

    const renderFlat = () => {
      return (
        <FlatList
          data={finalProductCategory}
          renderItem={this.renderItem}
          keyExtractor={(item, i) => i.toString()}
        />
      );
    };

    return (
      <View style={{ flex: 1 }}>
        {this.renderSearchBar()}
        {origin && origin === 'ProductDetail' ? renderFlat() : renderDraggable()}
      </View>
    );
  }

  renderSearchBar() {
    const { origin } = this.props;
    const { isSearchBarVisible } = this.state;

    return (
      <SearchBar
        isOpened={isSearchBarVisible}
        openedPlaceholder={I18n.t('productCategorySearchPlaceholderActive')}
        closedPlaceholder={I18n.t('productCategorySearchPlaceholder')}
        toggleSearch={this.toggleSearch.bind(this)}
        closeSearchAction={this.closeSearch.bind(this)}
        searchAction={this.searchCategoriesByName.bind(this)}
        plusAction={
          origin && origin === 'ProductDetail' ? null : () => this.openProductCategoryCreate()
        }
      />
    );
  }

  render() {
    const { hasCategories } = this.state;
    const { outerContainer } = scaffolding;
    return (
      <KyteSafeAreaView style={outerContainer}>
        {hasCategories ? this.renderContent() : this.renderEmptyContent()}
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  DraggableListStyle: {
    flex: 1,
  },
};

const mapStateToProps = (state) => ({
  productCategory: state.productCategory.list,
  user: state.auth.user,
  userHasReachedLimit: state.common.userHasReachedLimit,
});

export default connect(mapStateToProps, {
  checkUserReachedLimit,
  productCategoryDetailCreate,
  productCategoryDetailUpdate,
  productCategoryFetch,
  productCategoryFetchByName,
  productCategorySave,
  productCategoryReorder,
})(ProductCategoryList);
