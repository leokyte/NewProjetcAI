import React from 'react';
import {connect} from 'react-redux';
import {Container, Row} from '@kyteapp/kyte-ui-components';
import {NavigationContainer, NavigationIndependentTree} from '@react-navigation/native';
import {ProductsStack, ProductDetailStack} from '../';
import {colors} from '../../styles';
import { productDetailUpdate, productManagementReset } from '../../stores/actions/ProductActions';

const ProductsStackTablet = ({products, updateProductDetails, productDetail, resetProductManagement }) => {
  React.useEffect(() => {
    const [firstProduct] = products ?? [];

    if (firstProduct) {
      updateProductDetails(firstProduct);
    }

    // reseting on unmount
    return resetProductManagement;
  }, [products, updateProductDetails, resetProductManagement]);

  return (
    <Row flex={1}>
      <Container flex={1}>
        <NavigationIndependentTree>
          <NavigationContainer>
            <ProductsStack />
          </NavigationContainer>
        </NavigationIndependentTree>
      </Container>
      <Container flex={1} borderLeftWidth={1} borderColor={colors.borderColor}>
        <NavigationIndependentTree>
          <NavigationContainer key={productDetail?.id}>
            <ProductDetailStack  />
          </NavigationContainer>
        </NavigationIndependentTree>
      </Container>
    </Row>
  );
};

const mapStateToProps = (state) => ({
  products: state.products.innerList,
  productDetail: state.products.detail,
});

export default connect(mapStateToProps, {
  updateProductDetails: productDetailUpdate,
  resetProductManagement: productManagementReset,
})(ProductsStackTablet);
