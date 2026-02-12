import React from 'react'
import { useViewport } from '@kyteapp/kyte-ui-components'
import { connect } from 'react-redux'
import { KyteTabView, LoadingCleanScreen } from '../common'
import ProductsList from './items/ItemContainer'
import StockContainer from './stock/StockContainer'
// import ProductCategory from './categories/ProductCategoryList'
import { CategoryMigrationNotice } from './categories/CategoryMigrationNotice'
import ProductsCategoriesNav from './nav-options/ProductsCategoriesNav'
import I18n from '../../i18n/i18n'
import { ProductsTabKeys } from '../../enums'
import { KyteSafeAreaView } from '../common'
import { scaffolding } from '../../styles'

const ProductsIndex = ({ navigation, isLoading }) => {
	const viewport = useViewport()
  const { outerContainer } = scaffolding

	const routes = [
		{ key: ProductsTabKeys.Product, title: I18n.t('productTabTitle').toUpperCase() },
		{ key: ProductsTabKeys.Stock, title: I18n.t('stockContainerTitle').toUpperCase() },
		{ key: ProductsTabKeys.Categories, title: I18n.t('productsTabCategoriesLabel').toUpperCase() },
	]

	const scenes = {
		[ProductsTabKeys.Product]: () => <ProductsList viewport={viewport} navigation={navigation} />,
		[ProductsTabKeys.Stock]: () => <StockContainer navigation={navigation} />,
		[ProductsTabKeys.Categories]: () => <CategoryMigrationNotice />,
	}

	// TODO: descomentar para a versão 2.5.3
	// const handleIndexChange = (index) => {
	// 	if (index === ProductsTabKeys.Categories) {
	// 		navigation.navigate('Config', {
	// 			screen: 'ProductCategories',
	// 		})
	// 	}
	// }

	return (
		<KyteSafeAreaView style={outerContainer}>
			{isLoading ? <LoadingCleanScreen /> : null}
			<ProductsCategoriesNav navigation={navigation} />
			<KyteTabView scenes={scenes} routes={routes} lazy />
		</KyteSafeAreaView>
	)
}

const mapStateToProps = (state) => ({
	isLoading: state.common.loader.visible,
})

export default connect(mapStateToProps, {})(ProductsIndex)
