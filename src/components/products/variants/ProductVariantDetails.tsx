import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import { NavigationProp } from '@react-navigation/native'
import { Container } from '@kyteapp/kyte-ui-components'
import { DetailPage, LoadingCleanScreen } from '../../common'
import { IProductWithVariation } from '@kyteapp/kyte-utils'
import { colors } from '../../../styles'
import { generateVariantPageTitle } from '../../../util'
import VariantEditForm from './VariantEditForm'

interface ProductVariantDetailsProps {
	navigation: NavigationProp<any>
	productVariant: IProductWithVariation
	isLoading: boolean
}

const ProductVariantDetails: React.FC<ProductVariantDetailsProps> = ({ navigation, productVariant, isLoading }) => {
	const pageTitle = useMemo(() => generateVariantPageTitle(productVariant.variations), [productVariant?.variations])
	const containerStyle = { flex: 1, backgroundColor: colors.lightBg }

	return (
		<DetailPage goBack={navigation.goBack} navigate={navigation.navigate} navigation={navigation} pageTitle={pageTitle}>
			<Container style={containerStyle}>
				<VariantEditForm />
			</Container>
			{isLoading ? <LoadingCleanScreen /> : null}
		</DetailPage>
	)
}

const mapStateToProps = (state: any) => ({
	productVariant: state.variants.productVariant,
	isLoading: state.common.loader.visible,
})

export default connect(mapStateToProps, null)(ProductVariantDetails)
