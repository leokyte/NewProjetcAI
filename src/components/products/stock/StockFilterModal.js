import React, { Component } from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { CheckBox } from 'react-native-elements';
import _ from 'lodash';
import { ActionButton, KyteModal } from '../../common';
import { colors, scaffolding, Type, colorSet } from '../../../styles';
import { stockSetFilter, stockSetOrder, stockSetCategory, stockClearFilter } from '../../../stores/actions';
import I18n from '../../../i18n/i18n';

class StockFilterModal extends Component {
render() {
  const { bottomContainer } = scaffolding;
  const {
    mainSectionContainer,
    sectionTitle,
    sectionContainer,
    sectionItemContainer,
    checkStyles,
    checkboxText,
    buttonTextContainer,
    buttonText,
    eachSectionContainer
  } = styles;
  const { productCategory, stockFilters, stockOrder } = this.props;

  const productCategories = productCategory.map((eachCategory) => {
    return {
      title: eachCategory.name,
      active: !!(_.find(stockFilters.categories, (findCategory) => (findCategory.id === eachCategory.id))),
      action: () => this.props.stockSetCategory(eachCategory),
    };
  });

  const sections = [
    {
      title: I18n.t('stockContainerTitle'),
      type: 'checkbox',
      items: [
        {
          title: I18n.t('stockFilterNoStock'),
          active: stockFilters.stock.noStock,
          action: () => this.props.stockSetFilter('noStock', !stockFilters.stock.noStock),
          renderRedIndicator: true
        },
        {
          title: I18n.t('stockFilterBelowMinimum'),
          active: stockFilters.stock.noMinimum,
          action: () => this.props.stockSetFilter('noMinimum', !stockFilters.stock.noMinimum),
          renderYellowIndicator: true
        },
        {
          title: I18n.t('stockFilterAboveMinimum'),
          active: stockFilters.stock.aboveMinimum,
          action: () => this.props.stockSetFilter('aboveMinimum', !stockFilters.stock.aboveMinimum)
        },
        {
          title: I18n.t('stockFilterWithoutStockControl'),
          active: stockFilters.stock.withoutStockControl,
          action: () => this.props.stockSetFilter('withoutStockControl', !stockFilters.stock.withoutStockControl)
        },
      ],
    },
    {
      title: I18n.t('productsTabCategoriesLabel'),
      type: 'checkbox',
      orderByColumn: true,
      items: productCategories,
    },
    {
      title: I18n.t('stockOrderByTitle'),
      type: 'button',
      orderByColumn: true,
      items: [
        {
          title: I18n.t('stockOrderLowestStock'),
          active: stockOrder.lowestStock,
          action: () => this.props.stockSetOrder('lowestStock', !stockOrder.lowestStock)
        },
        {
          title: 'A-Z',
          active: stockOrder.aZ,
          action: () => this.props.stockSetOrder('aZ', !stockOrder.aZ)
        },
        {
          title: I18n.t('stockOrderHigherStock'),
          active: stockOrder.higherStock,
          action: () => this.props.stockSetOrder('higherStock', !stockOrder.higherStock)
        },
        {
          title: 'Z-A',
          active: stockOrder.zA,
          action: () => this.props.stockSetOrder('zA', !stockOrder.zA)
        },
      ],
    },
  ];

  const renderSections = () => {
    const renderRedIndicator = () => (<View style={{ width: 8, height: 8, backgroundColor: colors.errorColor, borderRadius: 8 }} />);
    const renderYellowIndicator = () => (<View style={{ width: 8, height: 8, backgroundColor: colors.warningColor, borderRadius: 8 }} />);

    const renderCheckBoxes = (items, orderByColumn) => {
      return items.map((eachItemSection, indexEachItem) => {
        return (
          <View style={[sectionItemContainer, { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }, orderByColumn ? { width: '50%' } : null]} key={indexEachItem}>
            <CheckBox
              containerStyle={checkStyles}
              checkedIcon={'check-box'}
              uncheckedIcon={'check-box-outline-blank'}
              iconType={'material'}
              onPress={eachItemSection.action}
              checkedColor={colors.actionColor}
              checked={eachItemSection.active}
              title={eachItemSection.title}
              textStyle={checkboxText}
            />
            {eachItemSection.renderRedIndicator ? renderRedIndicator() : null}
            {eachItemSection.renderYellowIndicator ? renderYellowIndicator() : null}
          </View>
        );
      });
    };

    const renderButtons = (items, orderByColumn) => {
      return items.map((eachItemSection, indexEachItem) => {
        return (
          <TouchableOpacity
            onPress={eachItemSection.action}
            activeOpacity={0.8}
            style={[sectionItemContainer, orderByColumn ? { width: '50%' } : null]}
            key={indexEachItem}
          >
            <View style={[buttonTextContainer, ([0, 1].indexOf(indexEachItem) >= 0) ? { borderTopWidth: 1 } : null]}>
              <Text style={[buttonText, eachItemSection.active ? [{ color: colors.actionColor }, Type.Medium] : null]}>
                {eachItemSection.title}
              </Text>
            </View>
          </TouchableOpacity>
        );
      });
    };

    return sections.map((eachSection, index) => {
      if (eachSection.items.length <= 0) return;
      return (
        <View style={sectionContainer} key={index}>
          <View style={{ paddingHorizontal: 20, paddingBottom: (index === sections.length - 1) ? 15 : 5 }}>
            <Text style={sectionTitle}>
              {eachSection.title}
            </Text>
          </View>
          <View style={eachSectionContainer}>
            <View style={eachSection.orderByColumn ? { flexWrap: 'wrap', flexDirection: 'row' } : null}>
              {eachSection.type === 'checkbox' ? renderCheckBoxes(eachSection.items, eachSection.orderByColumn) : renderButtons(eachSection.items, eachSection.orderByColumn)}
            </View>
          </View>
        </View>
      );
    });
  };

  return (
    <KyteModal
      fullPage
      fullPageTitle={I18n.t('stockFilterTitle')}
      height={'100%'}
      isModalVisible
      hideFullPage={() => { this.props.actionButton(); this.props.hideModal(); }}
      rightButtons={
        [{ title: I18n.t('words.s.clear'), onPress: () => this.props.stockClearFilter() }]
      }
    >
      <View style={mainSectionContainer}>
        <ScrollView>
          {renderSections()}
        </ScrollView>
      </View>
      <View style={[bottomContainer]}>
        <ActionButton onPress={this.props.actionButton}>
          {I18n.t('stockFilterButtonText')}
        </ActionButton>
      </View>
    </KyteModal>
  );
}
}

const styles = {
  mainSectionContainer: {
    flex: 1
  },
  sectionTitle: [
    Type.Medium,
    Type.fontSize(15),
    colorSet(colors.secondaryBg)
  ],
  sectionContainer: {
    flex: 1,
    paddingTop: 30
  },
  sectionItemContainer: {
    // paddingTop: 5
  },
  checkboxText: [
    Type.Regular,
    colorSet(colors.primaryColor),
    Type.fontSize(13),
    { fontWeight: 'normal' }
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
  buttonTextContainer: {
    padding: 20,
    borderColor: colors.borderDarker,
    borderBottomWidth: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5
  },
  buttonText: [
    Type.Regular,
    Type.fontSize(13)
  ],
  eachSectionContainer: {
    flex: 1,
    right: 3
  }
};

const mapStateToProps = (state) => ({
  productCategory: state.productCategory.list,
  stockFilters: state.stock.filters,
  stockOrder: state.stock.order
});
export default connect(mapStateToProps, { stockSetFilter, stockSetOrder, stockSetCategory, stockClearFilter })(StockFilterModal);
