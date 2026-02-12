import React, { useState } from 'react'
import { Dimensions, View, TouchableOpacity } from 'react-native'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import Modal from 'react-native-modal'

import { colors, gridStyles, msg } from '../../styles'
import { isIphoneX } from '../../util'
import { KyteSafeAreaView } from './KyteSafeAreaView'
import { KyteIcon } from './KyteIcon'
import ProductImage from '../products/image/ProductImage'

const KyteImageGallery = (props) => {
	const [index, setIndex] = useState(props.initialIndex || 0)

	const getProduct = () => {
		let productClone
		try {
			productClone = props.product.clone()
		} catch (ex) {
			productClone = props.product
		}

		return productClone
	}

	const renderItem = ({ item }) => (
		<ProductImage
			style={gridStyles.flexImage}
			product={{ ...getProduct(), image: item }}
			resizeMode={props.resizeMode || 'contain'}
			useLargeImage
		/>
	)

	const renderWithModal = () => (
		<Modal
			isVisible
			backdropColor="#000"
			backdropOpacity={1}
			hideOnBack={props.hideOnBack}
			onBackButtonPress={props.onBackButtonPress}
			style={{ margin: 0 }}
		>
			<KyteSafeAreaView style={{ flex: 1 }}>
				<TouchableOpacity
					style={[msg.messageClose, styles.headerButton(isIphoneX() ? 80 : 40)]}
					hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
					onPress={props.hideModal}
					activeOpacity={0.8}
				>
					<KyteIcon size={14} name="cross-thin" color={colors.primaryDarker} />
				</TouchableOpacity>
				{renderContent()}
			</KyteSafeAreaView>
		</Modal>
	)
	const renderContent = () => {
		const SCREEN_WIDTH = Dimensions.get('window').width
		return (
			<>
				<Carousel
					style={{ flex: 1 }}
					ref={(c) => {
						this._carousel = c
					}}
					data={props.gallery}
					renderItem={(item) => renderItem(item)}
					onBeforeSnapToItem={(slideIndex) => {
						if (props.onBeforeChangeImage) props.onBeforeChangeImage(slideIndex)
					}}
					onSnapToItem={(itemIndex) => {
						setIndex(itemIndex)
						if (props.onChangeImage) props.onChangeImage(itemIndex)
					}}
					sliderWidth={props.itemWidth || SCREEN_WIDTH}
					itemWidth={props.itemWidth || SCREEN_WIDTH}
					lockScrollWhileSnapping
					firstItem={index}
				/>
				<View style={styles.paginatorContainer}>
					<Pagination
						dotsLength={props.gallery.length}
						activeDotIndex={index}
						dotStyle={styles.paginatorItemActive}
						inactiveDotStyle={styles.paginatorItemInactive}
						inactiveDotScale={1}
						containerStyle={styles.paginator}
					/>
				</View>
			</>
		)
	}

	return props.isModal ? renderWithModal() : renderContent()
}

const styles = {
	galleryContainer: {
		flex: 1,
	},
	paginatorContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	paginator: {
		zIndex: 100,
		height: 17,
		borderRadius: 15,
		backgroundColor: '#FFF',
		opacity: 0.75,
		paddingVertical: 0,
		paddingHorizontal: 0,
		marginBottom: 40,
	},
	paginatorItemActive: {
		opacity: 1,
	},
	paginatorItemInactive: {
		opacity: 0.35,
	},
	headerButton: (top) => ({
		backgroundColor: '#FFFFFF',
		opacity: 0.9,
		borderRadius: 28,
		width: 30,
		height: 30,
		top,
	}),
}

export default React.memo(KyteImageGallery)
