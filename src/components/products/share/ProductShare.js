import { View } from 'react-native'
import React, { Component } from 'react'
import ViewShot from 'react-native-view-shot'
import Share from 'react-native-share'
import ProductQuickViewContent from '../quick-view/ProductQuickViewContent'
import { requestPermission } from '../../../util/util-permissions'
import { logEvent } from '../../../integrations'
import { PHOTO_LIBRARY } from '../../../enums'

class ProductShare extends Component {
	constructor(props) {
		super(props)

		this.viewShotRef = React.createRef()

		this.state = {
			imageLoaded: false,
			componentDidMount: false,
		}
	}

	componentDidMount() {
		const { imageLoaded } = this.state

		if (imageLoaded) this.shareProduct()
		else this.setState({ componentDidMount: true })
	}

	imageLoaded() {
		const { componentDidMount } = this.state

		if (componentDidMount) this.shareProduct()
		else this.setState({ imageLoaded: true })
	}

	async shareProduct() {
		const hasPermission = await requestPermission(PHOTO_LIBRARY)
		if (hasPermission) {
			this.takeShot()
			logEvent('Receipt Shared')
		}
	}

	takeShot() {
		const viewShot = this.viewShotRef.current
		if (!viewShot) {
			return
		}
		viewShot.capture().then((uri) => {
			Share.open(
				{
					title: '',
					message: '',
					url: uri,
				},
				this.props.hideShare()
			)
		})
	}

	//
	// Main
	//

	render() {
		const { product } = this.props

		return (
			<View style={style.wrapper}>
				<ViewShot
					style={style.viewShot}
					options={{ format: 'png', quality: 0.9, result: 'data-uri' }}
					ref={this.viewShotRef}>
					<ProductQuickViewContent
						product={product}
						imageHeight={320}
						isShare
						onImageLoaded={() => this.imageLoaded()}
					/>
				</ViewShot>
			</View>
		)
	}
}

const style = {
	wrapper: {
		position: 'absolute',
		top: 0,
		right: 0,
		left: 0,
		bottom: 0,
		zIndex: -10,
	},
	viewShot: {
		backgroundColor: 'white',
	},
}

export default ProductShare
