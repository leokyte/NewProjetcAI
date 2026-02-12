import React, { memo, useMemo, useCallback, useEffect } from 'react'
import { SectionList } from 'react-native'
import { IProductVariant } from '@kyteapp/kyte-utils'
import { Divider, Padding, Margin, Container } from '@kyteapp/kyte-ui-components'
import { groupSkusByPrimaryVariation } from '../../../../../util/products/util-variants'
import GroupedSKUsHeader from './GroupedSKUsHeader'
import { IVariant } from '../../../../../stores/variants/variants.types'
import { colors } from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { logEvent } from '../../../../../integrations'

type TrenderSKUItemParams = {
	index: number
	count?: number
	sku: Partial<IProductVariant>
	variation?: Partial<IVariant>
}

interface GroupedSKUsProps {
	skus?: Partial<IProductVariant>[]
	renderSKUItem?: (params: TrenderSKUItemParams) => React.ReactNode
	renderGroupHeader?: (group: ReturnType<typeof groupSkusByPrimaryVariation>[0]) => React.ReactNode
}

type Section = {
	title: string
	data: Partial<IProductVariant>[]
}

const GroupedSKUs: React.FC<GroupedSKUsProps> = memo(({ skus = [], renderSKUItem, renderGroupHeader }) => {
	// 1) group once
	const grouped = useMemo(() => groupSkusByPrimaryVariation(skus), [skus])
	// 2) detect if there’s really more than one variation dimension
	const hasMultiple = (skus[0]?.variations?.length || 1) > 1

	// 3) build SectionList-friendly structure
	const sections: Section[] = useMemo(
		() =>
			grouped.map(({ primaryKey, skus, primaryVariation }) => ({
				title: primaryKey,
				data: skus,
				primaryVariation,
			})),
		[grouped, hasMultiple]
	)

	// 4) memoize the header renderer
	const renderSectionHeader = useCallback(
		({ section }) => (
			<Padding vertical={hasMultiple && !renderItem ? 8 : 0}>
				{!hasMultiple && <Divider size={8} color={colors.gray07} />}
				<Margin bottom={hasMultiple && !!renderItem ? 8 : 0} />
				{renderGroupHeader?.({ primaryKey: section.title, skus: section.data, primaryVariation: section.primaryVariation }) ?? (
					<GroupedSKUsHeader primaryKey={section.title} onPress={() => {}} />
				)}
			</Padding>
		),
		[hasMultiple, renderGroupHeader]
	)

	// 5) memoize the item renderer
	const renderItem = useCallback(
		({ item, index }: { item: Partial<IProductVariant>; index: number }) => {
			const secVar = item.variations?.find((v) => !v.isPrimary) ?? item.variations?.slice(-1)[0]
			const params = {
				index,
				count: item.variations?.length,
				sku: item,
				variation: secVar,
			}
			
			return hasMultiple ? (
				<Container borderBottomWidth={1} borderColor={colors.gray07}>
					{renderSKUItem?.(params)}
				</Container>
			) : null
		},
		[hasMultiple, renderSKUItem]
	)

	useEffect(() => {
		logEvent("Product Variants List View")
	}, [])

	return (
		<SectionList
			sections={sections}
			keyExtractor={(item, idx) => item._id ?? item.id ?? String(idx)}
			renderSectionHeader={renderSectionHeader}
			renderItem={renderItem as any}
			stickySectionHeadersEnabled={false}
			initialNumToRender={20}
			maxToRenderPerBatch={20}
			windowSize={15}
			removeClippedSubviews
			showsVerticalScrollIndicator={true}
		/>
	)
})

export default GroupedSKUs
