import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { connect } from 'react-redux'

import { KyteIcon } from '../../common'
import { fileExists, localFileExist, getImagePath } from '../../../util'
import useProductImageUrl from '../../../hooks/use-product-image-url'

const ProductImage = (props) => {
	const serverImageUrl = useProductImageUrl(props.product, props.useLargeImage || props.useLegacyImage)
	const [imageExist, setImageExist] = useState(Boolean(props.product.image))
	const [imageUrl, setImageUrl] = useState(serverImageUrl)
	const [retries, setRetries] = useState(0)
	const [localImage, setLocalImage] = useState('')

	let timeoutHandler

	useEffect(() => {
		return () => {
			if (!!timeoutHandler) clearTimeout(timeoutHandler)
		}
	}, [])

	useEffect(() => {
		if (!props.product.image) {
			setImageExist(false)
			setLocalImage('')
			setImageUrl('')
		}
	}, [props.product.image])

	const reCheckImage = () => {
		timeoutHandler = setTimeout(() => checkImage(), 7000)
	}

	const checkImage = () => {
		const newImage = serverImageUrl
		fileExists(
			newImage,
			() => {
				setImageExist(true)
				setImageUrl(newImage)
			},
			() => {
				if (retries === 3) return
				resetImage()
				setRetries(retries + 1)
				reCheckImage()
			}
		)
	}

	const resetImage = () => {
		setImageUrl('')
		setLocalImage('')
		setImageExist(false)
	}

	const renderIcon = () => {
		return (
			<View style={[styles.iconContainer, props.iconContainerStyle]}>
				<KyteIcon name={props.iconName || 'load'} size={props.iconSize || 38} color={props.iconColor || '#FFFFFF'} />
			</View>
		)
	}

	const onError = () => {
		const localImgPath = getImagePath(props.product.image)
		localFileExist(localImgPath).then((exist) => {
			if (exist) {
				setLocalImage(localImgPath)
			} else {
				resetImage()
				checkImage()
			}
		})
	}

	const renderImage = () => {
		const uri = localImage || imageUrl
		return (
			<View style={props.style}>
				<FastImage
					{...props}
					style={{ flex: 1, ...props?.style }}
					source={{ uri, ...props?.source }}
					onError={() => onError()}
					resizeMode={props.resizeMode}
				/>
			</View>
		)
	}

	return !!imageExist ? renderImage() : renderIcon()
}

const styles = {
	iconContainer: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#e1e3e6',
		borderTopLeftRadius: 4,
		borderTopRightRadius: 4,
	},
}

const mapStateToProps = ({ sync, preference }) => ({
	updatedDocument: sync.syncDownResult.syncUpdatedDocument,
	useLegacyImage: preference.account.useLegacyImage,
})

export default connect(mapStateToProps)(ProductImage)
