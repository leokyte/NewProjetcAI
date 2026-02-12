import React from 'react';
import { connect } from 'react-redux';
import { Container } from '@kyteapp/kyte-ui-components';
import I18n from '../../../i18n/i18n';
import _ from 'lodash';

import { productCategorySelect, productsFetch } from '../../../stores/actions';
import ProductCategoryHorizontaList from '../product-sale/ProductCategoryHorizontaList';
import { colors } from '../../../styles';
import { hasPinCategory } from '../../../util';

const CurrentSaleCategories = (props) => {
    const { productCategoryGroupResult, selectedCategory, checkoutSort } = props;
    const pinProductsCategory = hasPinCategory() ? [{ name: I18n.t('pinProductsCategoryName'), id: 'pin' }] : [];
    const finalProductsCategory = [{ name: I18n.t('words.s.all'), id: null }]
      .concat(pinProductsCategory)
      .concat(productCategoryGroupResult);

    const selectCategory = (category) => {
        const sort = { key: checkoutSort || 'dateCreation', isDesc: false };
        props.productCategorySelect(category);
        props.productsFetch(sort, null, category, { limit: 30, length: 0 }, 'reboot');
    };

    if (selectedCategory) {
      const selectedCategoryExists = _.findIndex(finalProductsCategory, eachCategory => {
        return eachCategory.id === selectedCategory.id;
      });

      if (selectedCategoryExists === -1) {
        props.productCategorySelect(finalProductsCategory[0]);
      }
    }

    return productCategoryGroupResult.length > 0 && (
        <Container borderBottomWidth={1} borderColor={colors.borderColor}>
            <ProductCategoryHorizontaList
                data={finalProductsCategory}
                onPress={selectCategory}
                selectedItem={selectedCategory ? selectedCategory.id : null}
            />
        </Container>
    );
};

const mapStateToProps = ({ productCategory, preference }) => ({
    selectedCategory: productCategory.selected,
    checkoutSort: preference.account.checkoutSort,
    productCategoryGroupResult: productCategory.categoriesGroupResult,
});

export default connect(mapStateToProps, { productCategorySelect, productsFetch })(CurrentSaleCategories);
