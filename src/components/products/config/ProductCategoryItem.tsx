import React from 'react'
import { TouchableOpacity, TextStyle } from 'react-native'
import { capitalizeFirstLetter, generateTestID } from '../../../util'
import { lineStyles, Type } from '../../../styles'
import { colors } from '@kyteapp/kyte-ui-components/src/packages/styles/colors'

import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import KyteIcon from '@kyteapp/kyte-ui-components/src/packages/icons/KyteIcon/KyteIcon'

type ProductCategory = {
	name: string
}

interface ProductCategoryItemListProps {
	productCategory: ProductCategory
	onPress: () => void
	onLongPress?: () => void
	isActive?: boolean
}

const ProductCategoryItemList: React.FC<ProductCategoryItemListProps> = ({
	productCategory,
	onPress,
	onLongPress,
	isActive = false,
}) => {
	const renderLeftContent = () => {
		const { nameStyle } = lineStyles
		const productLabel = capitalizeFirstLetter(productCategory.name)

		return (
			<Container alignItems="flex-start" justifyContent="center" flex={onLongPress ? 0.8 : 1}>
				<KyteText
					allowFontScaling={false}
					numberOfLines={1}
					style={[nameStyle, Type.Regular, { paddingRight: 0, paddingTop: 5 }] as TextStyle}
					{...generateTestID('categ-name-ps')}
				>
					{productLabel}
				</KyteText>
			</Container>
		)
	}

	const renderRightContent = () => {
		return (
			<Container flex={0.2} alignItems="flex-end" justifyContent="center">
				<KyteIcon name="reorder" size={20} color={colors.gray02Kyte} />
			</Container>
		)
	}

	return (
		<TouchableOpacity activeOpacity={0.9} onPress={onPress} onLongPress={onLongPress} delayLongPress={200}>
			<Container
				flex={1}
				flexDirection="row"
				borderBottomWidth={1}
				borderColor={colors.borderColor}
				padding={19}
				backgroundColor={isActive ? colors.borderColor : '#FFFFFF'}
			>
				{renderLeftContent()}
				{onLongPress ? renderRightContent() : null}
			</Container>
		</TouchableOpacity>
	)
}

export default ProductCategoryItemList
