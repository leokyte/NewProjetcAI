import React, { useCallback } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { TextStyle, TouchableOpacity } from 'react-native'
import KyteIcon from '@kyteapp/kyte-ui-components/src/packages/icons/KyteIcon/KyteIcon'
import { lineStyles, Type } from '../../../../styles'
import { colors } from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { capitalizeFirstLetter, generateTestID } from '../../../../util'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'

type VariationOption = {
	id: string | number
	title: string
}

type VariationOptionDraggableFlatlistProps = {
	options: VariationOption[]
	onPress?: (item: VariationOption) => void
	onDragEnd?: (options: VariationOption[]) => void
	renderBottomContent?: () => React.ReactNode
}

export const VariationOptionDraggableFlatlist: React.FC<VariationOptionDraggableFlatlistProps> = ({
	options,
	onPress,
	onDragEnd,
	renderBottomContent,
}) => {
	const renderLeftContent = (name: string) => {
		const { nameStyle } = lineStyles
		const productLabel = capitalizeFirstLetter(name)

		return (
			<Container alignItems="flex-start" justifyContent="center" flex={1}>
				<KyteText
					allowFontScaling={false}
					numberOfLines={1}
					style={[nameStyle, Type.Regular, { paddingRight: 0, paddingTop: 5 }] as TextStyle}
					{...generateTestID('option-name-ps')}
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

	const renderItem = useCallback(
		({ item, drag, isActive }: { item: VariationOption; drag: () => void; isActive: boolean }) => {
			return (
				<TouchableOpacity
					activeOpacity={0.9}
					onLongPress={drag}
					delayLongPress={200}
					onPress={() => !isActive && onPress?.(item)}
				>
					<Container
						flex={1}
						flexDirection="row"
						borderBottomWidth={1}
						borderColor={colors.borderColor}
						padding={19}
						backgroundColor={isActive ? colors.borderColor : '#FFFFFF'}
					>
						{renderLeftContent(item.title)}
						{renderRightContent()}
					</Container>
				</TouchableOpacity>
			)
		},
		[onPress]
	)

	const keyExtractor = useCallback((item: VariationOption) => String(item.id), [])

	const handleDragEnd = useCallback(
		({ data }: { data: VariationOption[] }) => {
			onDragEnd?.(data)
		},
		[onDragEnd]
	)

	return (
		<DraggableFlatList
			data={options}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			onDragEnd={handleDragEnd}
			ListFooterComponent={renderBottomContent ? () => <>{renderBottomContent()}</> : null}
		/>
	)
}
