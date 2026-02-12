import { View, TouchableOpacity } from 'react-native'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { checkIsParentProduct } from '@kyteapp/kyte-utils'
import {
	productDetailUpdate,
	productDetailBySale,
	checkPlanKeys,
	checkFeatureIsAllowed,
	toggleBillingMessage,
} from '../../../stores/actions'
import { colors } from '../../../styles'
import { KyteQuickView, KyteIcon } from '../../common'
import { checkStockValueStatus, checkUserPermission, getVirtualCurrentStock, generateTestID, checkIsProductAVariant } from '../../../util'
import ProductQuickViewContent from './ProductQuickViewContent'
import ProductShare from '../share/ProductShare'
import { DetailOrigin, Features } from '../../../enums'
import KyteImageGallery from '../../common/KyteImageGallery'

// Props:
//    - navigation
//    - products
//    - isQuickViewVisible
//    + hideQuickView()

class ProductQuickView extends Component {
	constructor(props) {
		super(props)

		this.checkStockKey()
		this.checkProductGalleryKey()

		this.state = {
			isPhotoZoom: false,
			shareProduct: false,
			permissions: checkUserPermission(this.props.user.permissions),
			stockKeyAllowed: false,
			scrollGalleryAllowed: false,
			galleryIndex: 0,
		}
	}

	//
	// ICONS handler
	//

	// Handle icons click redirect
	goToSpecificProduct(product, index = 0) {
		const { navigate } = this.props.navigation
		const { origin } = this.props

		// Check the origin
		if (origin === DetailOrigin.BY_SALE) this.props.productDetailBySale(product)
		else this.props.productDetailUpdate(product)

		navigate('ProductDetail', { index })
	}

	async checkStockKey() {
		const stockKey = Features.items[Features.STOCK].key
		this.setState({ stockKeyAllowed: await this.props.checkPlanKeys(stockKey) })
	}

	async checkProductGalleryKey() {
		const productGalleryKey = Features.items[Features.PRODUCT_GALLERY].key
		this.setState({
			scrollGalleryAllowed: await this.props.checkPlanKeys(productGalleryKey),
		})
	}

	// Check stock to include 3rd icon
	verifyStock(product) {
		const { hideQuickView } = this.props

		if (product.stock && product?.stockActive) {
			const stockStatus = checkStockValueStatus(getVirtualCurrentStock(product), product.stock, product)

			// let backgroundColor = colors.secondaryBg;
			let backgroundColor = colors.actionDarkColor
			if (stockStatus === 'error') backgroundColor = colors.errorColor
			else if (stockStatus === 'warning') backgroundColor = colors.warningColor

			return {
				type: 'text',
				name: getVirtualCurrentStock(product),
				backgroundColor,
				onPress: () => {
					this.goToSpecificProduct(product, 1)
					hideQuickView()
				},
				...generateTestID('stock-pdck'),
			}
		}
		return null
	}

	//
	// Share
	//

	goToProductShare() {
		const { navigate } = this.props.navigation
		const { product, hideQuickView } = this.props

		hideQuickView()
		navigate('ProductShareOptions', { product })
	}

	shareProduct() {
		const { product } = this.props
		return <ProductShare product={product} hideShare={() => this.setState({ shareProduct: false })} />
	}

	//
	// Image Zoom
	//
	renderImageZoomIcon() {
		return (
			<TouchableOpacity
				onPress={() => this.setState({ isPhotoZoom: true })}
				style={style.zoomIcon}
				{...generateTestID('zoom-pdck')}
			>
				<KyteIcon name="zoom" color={colors.secondaryBg} size={18} />
			</TouchableOpacity>
		)
	}

	//
	// PHOTO ZOOM
	//

	renderPhotoZoom(productClone, isVariantProduct) {
		const { product } = this.props
		const { galleryIndex } = this.state
		
		const imageVariant = product.image.split('%2F').pop().split('?')[0];
    const imageUrl = isVariantProduct ? imageVariant : product.image;
		const gallery = [imageUrl]
		if (!!product.gallery && product.gallery.length) product.gallery.forEach((g) => gallery.push(g.url))

		return (
			<KyteImageGallery
				product={productClone}
				gallery={gallery}
				initialIndex={galleryIndex}
				hideOnBack
				hideModal={() => this.setState({ isPhotoZoom: false })}
				onBeforeChangeImage={() => this.handleBeforeChangeImage()}
				onBackButtonPress={() => this.setState({ isPhotoZoom: false })}
				onChangeImage={(index) => this.setState({ galleryIndex: index })}
				isModal
			/>
		)
	}

	async handleBeforeChangeImage() {
		const { scrollGalleryAllowed } = this.state
		const productGalleryKey = Features.items[Features.PRODUCT_GALLERY].key
		await this.checkProductGalleryKey(productGalleryKey)

		if (!scrollGalleryAllowed) {
			await this.props.hideQuickView()
			setTimeout(() => this.props.toggleBillingMessage(true, 'free'), 1)
		}
	}

	//
	// Main render
	//
	render() {
		const { isQuickViewVisible, product, hideQuickView, user } = this.props
		const { permissions, stockKeyAllowed } = this.state
		const hasVariants = checkIsProductAVariant(product);
		const isParentProduct = checkIsParentProduct(product);
		const isVariantProduct = hasVariants && !isParentProduct;
		const productClone = isVariantProduct ? {...product, uid: user?.uid} : product

		const iconList = []

		if (permissions.allowProductsRegister) {
			iconList.push({
				type: 'icon',
				name: 'edit',
				onPress: () => {
					this.goToSpecificProduct(product)
					hideQuickView()
				},
				...generateTestID('add-nck'),
			})
		}

		iconList.push({
			type: 'icon',
			name: 'share',
			onPress: () => this.goToProductShare(),
		})

		const stockIcon = this.verifyStock(product)
		if (stockIcon && permissions.allowStockManager && stockKeyAllowed) iconList.push(stockIcon)

		const renderContent = () => (
			<KyteQuickView
				isQuickViewVisible={isQuickViewVisible}
				hideQuickView={() => hideQuickView()}
				iconList={this.props.disableButtons ? [] : iconList}
			>
				{product.image || (product.gallery && product.gallery.length) ? this.renderImageZoomIcon() : null}
				<ProductQuickViewContent
					product={productClone}
					galleryIndex={this.state.galleryIndex}
					onBeforeChangeImage={() => this.handleBeforeChangeImage()}
					onChangeImage={(index) => this.setState({ galleryIndex: index })}
				/>
				{this.state.shareProduct ? this.shareProduct() : null}
			</KyteQuickView>
		)

		return <View>{this.state.isPhotoZoom ? this.renderPhotoZoom(productClone, isVariantProduct) : renderContent()}</View>
	}
}

const style = {
	zoomIcon: {
		position: 'absolute',
		right: 15,
		top: 10,
		zIndex: 50,

		width: 36,
		height: 36,
		borderRadius: 25,
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
	},
}

const mapStateToProps = (state) => ({
	user: state.auth.user,
})

export default connect(mapStateToProps, {
	productDetailUpdate,
	productDetailBySale,
	checkPlanKeys,
	checkFeatureIsAllowed,
	toggleBillingMessage,
})(ProductQuickView)
