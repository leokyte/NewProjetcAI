import React from 'react'
import { connect } from 'react-redux'
import { RootState } from '../../../types/state/RootState'
import { DetailPage } from '../../common/scaffolding/DetailPage'
import ProductStock from './ProductStock'
import { getVariantName } from '../../../util/products/util-variants'
import { useNavigation } from '@react-navigation/native'
import { IProductVariant } from '@kyteapp/kyte-utils'
import { LoadingCleanScreen } from '../../common/LoadingCleanScreen'

interface Props {
	product: IProductVariant
	isLoading?: boolean
}
const VariantStockDetailScreen: React.FC<Props> = ({ product, isLoading }) => {
	const navigation = useNavigation()

	return (
		<DetailPage pageTitle={getVariantName(product)} goBack={navigation.goBack}>
			{isLoading && <LoadingCleanScreen />}
			<ProductStock navigation={navigation} product={product} />
		</DetailPage>
	)
}

function mapStateToProps(
	{ common, variants }: RootState,
	ownProps: { route: { params: { product: IProductVariant } } }
) {
	return {
		product: ownProps?.route?.params?.product ?? variants?.productVariant,
		isLoading: common.loader.visible,
	}
}
export default connect(mapStateToProps)(VariantStockDetailScreen)
