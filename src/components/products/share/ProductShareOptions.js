import { View, ScrollView, Dimensions } from 'react-native'
import React, { useRef } from 'react'
import { connect } from 'react-redux'
import ViewShot from 'react-native-view-shot'
import Share from 'react-native-share'
import { ListOptions, KyteToolbar, KyteSafeAreaView } from '../../common'
import { scaffolding } from '../../../styles'
import ProductQuickViewContent from '../quick-view/ProductQuickViewContent'
import I18n from '../../../i18n/i18n'
import { getCatalogoURLProduct } from '../../../util'
import { requestPermission } from '../../../util/util-permissions'
import { PHOTO_LIBRARY } from '../../../enums'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'

const ProductShareOptions = ({ store, route, navigation }) => {
	const viewShotRef = useRef()

	const takeShot = () => {
		const { product } = route.params
		const isCatalogActivated = store.catalog && store.catalog.active && store.urlFriendly && product.showOnCatalog
		const catalogURL = getCatalogoURLProduct(product, store)
		const productURL = `${catalogURL}/${product.id}`

		viewShotRef.current.capture().then((uri) => {
			let defaultShareObject = { url: uri }
			if (isCatalogActivated) {
				defaultShareObject = {
					...defaultShareObject,
					title: productURL,
					message: productURL,
				}
			}
			Share.open(defaultShareObject)
		})
	}

	const renderShareOptions = () => {
		const { share } = I18n.t('receiptShareOptions')

		const options = [
			{
				title: share,
				leftIcon: { icon: 'share', color: '#FFF' },
				onPress: async () => {
					const hasPermission = await requestPermission(PHOTO_LIBRARY)
					if (hasPermission) {
						takeShot()
					}
				},
			},
		]

		return <ListOptions reverseColor items={options} hideChevron />
	}

	const { params } = route
	const { product } = params
	const { containerStyles, containerBg } = styles
	const { outerContainer } = scaffolding

	return (
		<KyteSafeAreaView style={outerContainer}>
			<Container flex={1}>
				<KyteToolbar
					showCloseButton
					innerPage
					borderBottom={0}
					headerTitle=""
					position="absolute"
					backgroundColor="transparent"
					useIconCircle
					style={[{ marginLeft: 15 }]}
					goBack={() => navigation.goBack()}
				/>
				<View style={containerStyles}>
					<ScrollView style={containerBg}>
						<ViewShot
							style={containerBg}
							ref={viewShotRef}
							options={{ format: 'png', quality: 0.9, result: 'data-uri' }}
						>
							<ProductQuickViewContent product={product} imageHeight={320} itemWidth={Dimensions.get('window').width} />
						</ViewShot>
					</ScrollView>
					{renderShareOptions()}
				</View>
			</Container>
		</KyteSafeAreaView>
	)
}

const styles = {
	containerStyles: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	kyteIconSpacing: {
		marginRight: 15,
		marginLeft: 8,
	},
	libIconSpacing: {
		marginRight: 14,
		marginLeft: 7,
	},
	containerBg: {
		backgroundColor: '#FFF',
	},
}

const mapStateToProps = (state) => ({
	store: state.auth.store,
})

export default connect(mapStateToProps)(ProductShareOptions)
