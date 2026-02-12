import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import { colors, lineStyles, Type } from '../../../styles'
import { capitalizeFirstLetter, generateTestID } from '../../../util'

class ProductCategoryItemList extends Component {
	renderLeftContent() {
		const { nameStyle } = lineStyles
		const { leftContainer } = styles
		const { productCategory, onLongPress } = this.props

		const productLabel = capitalizeFirstLetter(productCategory.name)
		return (
			<View style={[leftContainer, { flex: onLongPress ? 0.8 : 1 }]}>
				<Text
					allowFontScaling={false}
					numberOfLines={1}
					style={[nameStyle, Type.Regular, { paddingRight: 0, paddingTop: 5 }]}
					{...generateTestID('categ-name-ps')}
				>
					{productLabel}
				</Text>
			</View>
		)
	}

	renderRightContent() {
		const { rightContainer } = styles
		return (
			<View style={rightContainer}>
				<Icon name="menu" size={20} color={colors.disabledIcon} />
			</View>
		)
	}
	render() {
		const { container } = styles
		const { onLongPress } = this.props

		return (
			<TouchableOpacity
				style={container(this.props.isActive)}
				activeOpacity={0.9}
				onPress={() => this.props.onPress()}
				onLongPress={this.props.onLongPress}
				delayLongPress={200}
			>
				{this.renderLeftContent()}
				{onLongPress ? this.renderRightContent() : null}
			</TouchableOpacity>
		)
	}
}

const styles = {
	container: (active) => ({
		flex: 1,
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderColor: colors.borderColor,
		paddingHorizontal: 19,
		paddingVertical: 20,
		backgroundColor: active ? colors.borderColor : '#FFFFFF',
	}),
	leftContainer: {
		alignItems: 'flex-start',
		justifyContent: 'center',
	},
	rightContainer: {
		flex: 0.2,
		alignItems: 'flex-end',
		justifyContent: 'center',
	},
}

export default ProductCategoryItemList
