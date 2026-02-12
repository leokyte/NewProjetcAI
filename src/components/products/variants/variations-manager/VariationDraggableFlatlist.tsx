import React, { useCallback, useState, useEffect, useMemo } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { TextStyle, TouchableOpacity } from 'react-native'
import { IVariant } from '../../../../stores/variants/variants.types'
import KyteIcon from '@kyteapp/kyte-ui-components/src/packages/icons/KyteIcon/KyteIcon'
import { lineStyles, Type } from '../../../../styles'
import { colors } from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { capitalizeFirstLetter, generateTestID } from '../../../../util'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'

type IVariantOption = IVariant['options']
type IVariantOptionItem = IVariantOption[0]

type VariationDraggableFlatlistProps = {
	variations: IVariantOption
	onOrderChange?: (hasChanges: boolean, updatedVariations: IVariantOption) => void
	maxToRenderPerBatch?: number
	initialNumToRender?: number
	updateCellsBatchingPeriod?: number
	windowSize?: number
	autoscrollSpeed?: number
	onPress?: (item: IVariantOptionItem) => void
	renderFooterComponent?: React.ReactNode
}

export const VariationDraggableFlatlist: React.FC<VariationDraggableFlatlistProps> = ({
	variations,
	onOrderChange,
	maxToRenderPerBatch = 30,
	initialNumToRender = 12,
	updateCellsBatchingPeriod = 70,
	windowSize = 31,
	autoscrollSpeed = 10,
	renderFooterComponent,
	onPress,
}) => {
	const [inMemoryVariations, setInMemoryVariations] = useState<IVariantOption>(variations)

	useEffect(() => {
		setInMemoryVariations(variations)
	}, [variations])

	const hasOrderChanges = useMemo(() => {
		if (variations.length !== inMemoryVariations.length) return true

		const originalOrderMap = new Map<string, number>()
		const currentOrderMap = new Map<string, number>()

		const getItemIdentifier = (item: any) => {
			if (item?.id) return String(item.id)
			if (item?.title) return String(item.title)
			return JSON.stringify(item)
		}

		variations.forEach((item, index) => {
			const identifier = getItemIdentifier(item)
			if (identifier) {
				originalOrderMap.set(identifier, index)
			}
		})

		inMemoryVariations.forEach((item, index) => {
			const identifier = getItemIdentifier(item)
			if (identifier) {
				currentOrderMap.set(identifier, index)
			}
		})

		return variations.some((originalItem) => {
			const identifier = getItemIdentifier(originalItem)
			if (!identifier) return false
			const originalOrder = originalOrderMap.get(identifier)
			const currentOrder = currentOrderMap.get(identifier)
			return originalOrder !== currentOrder
		})
	}, [variations, inMemoryVariations])

	useEffect(() => {
		onOrderChange?.(hasOrderChanges, inMemoryVariations)
	}, [hasOrderChanges, inMemoryVariations, onOrderChange])

	const renderLeftContent = (name: string, onLongPress: boolean) => {
		const { nameStyle } = lineStyles
		const productLabel = capitalizeFirstLetter(name)

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

	const renderItem = useCallback(
		({ item, drag, isActive }: { item: IVariantOptionItem; drag: () => void; isActive: boolean }) => {
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
						{renderLeftContent(item.title, false)}
						{renderRightContent()}
					</Container>
				</TouchableOpacity>
			)
		},
		[onPress]
	)

	const updateVariationOrder = useCallback((newOrder: IVariantOption) => {
		setInMemoryVariations(newOrder)
	}, [])

	const keyExtractor = useCallback(
		(item: IVariantOptionItem, index: number) => (item?.id ? String(item.id) : `draggable-item-${index}`),
		[]
	)

	const resetOrder = useCallback(() => {
		setInMemoryVariations(variations)
	}, [variations])

	const getModifiedVariations = useCallback(() => {
		return inMemoryVariations
	}, [inMemoryVariations])

	React.useImperativeHandle(undefined, () => ({
		resetOrder,
		getModifiedVariations,
		hasOrderChanges,
	}))

	return (
		<DraggableFlatList
			data={inMemoryVariations}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			onDragEnd={({ data }) => {
				updateVariationOrder(data)
			}}
			maxToRenderPerBatch={maxToRenderPerBatch}
			initialNumToRender={initialNumToRender}
			updateCellsBatchingPeriod={updateCellsBatchingPeriod}
			windowSize={windowSize}
			autoscrollSpeed={autoscrollSpeed}
			ListFooterComponent={renderFooterComponent ? () => <>{renderFooterComponent}</> : null}
		/>
	)
}
