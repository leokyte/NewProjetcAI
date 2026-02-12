import React, { useState, useCallback, useMemo } from 'react'
import { ScrollView, Image, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { Container, KyteButton, Tag } from '@kyteapp/kyte-ui-components'
import Checkbox from '@kyteapp/kyte-ui-components/src/packages/form/checkbox/Checkbox'
import { KyteIcon, KyteScreen } from '../../common'
import I18n from '../../../i18n/i18n'
import { clearAIProductSuggestions, setAISuggestionsApplied } from '../../../stores/actions'
import { RootState } from '../../../types/state/RootState'
import { getFormValues } from 'redux-form'
import { formatCurrencyValue, generateTestID } from '../../../util'
import { logEvent } from '../../../integrations'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import { ICategory, IProduct } from '@kyteapp/kyte-utils'
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import { CommonActions } from '@react-navigation/native'

const Strings = {
	t_title: I18n.t('aiProductSuggestions.title'),
	t_subtitle: I18n.t('aiProductSuggestions.subtitle'),
	t_apply: I18n.t('apply'),
	t_discard: I18n.t('alertDiscard'),
	t_name: I18n.t('productLabelPlaceholder'),
	t_price: I18n.t('productPricePlaceholder'),
	t_description: I18n.t('productDescriptionLabel'),
	t_category: I18n.t('productCategoryFieldPlaceholder'),
	t_ai_disclaimer: I18n.t('aiProductSuggestions.disclaimer'),
	t_new: I18n.t('words.s.new'),
}

interface AISuggestions {
	name: string
	description: string
	salePrice: number
	category: ICategory
	image: string
}

interface AIProductIdentifiedProps {
	navigation: any
	route: any
	aiSuggestions: AISuggestions
	clearAIProductSuggestions: () => void
	setAISuggestionsApplied: (applied: boolean) => void
}

type SelectedFields = {
	name: boolean
	salePrice: boolean
	category: boolean
	description: boolean
}

const mapStateToProps = (state: RootState) => ({
	aiSuggestions: state.products.aiSuggestions,
	currency: state.preference.account.currency,
	decimalCurrency: state.preference.account.decimalCurrency,
	store: state.auth.store,
	formValues: getFormValues('ProductSave')(state as any),
	categories: state.productCategory.list,
})

const mapDispatchToProps = {
	clearAIProductSuggestions,
	setAISuggestionsApplied,
}

type StateProps = ReturnType<typeof mapStateToProps>
type ActionProps = typeof mapDispatchToProps
type Props = AIProductIdentifiedProps & StateProps & ActionProps

const AIProductIdentified: React.FC<Props> = ({
	navigation,
	aiSuggestions,
	route,
	currency,
	decimalCurrency,
	clearAIProductSuggestions,
	setAISuggestionsApplied,
	store,
	formValues,
	categories,
}) => {
	const [selectedFields, setSelectedFields] = useState<SelectedFields>({
		name: true,
		salePrice: true,
		category: true,
		description: true,
	})
	const shouldDisableButton = useMemo(() => {
		return Object.values(selectedFields).every((value) => !value)
	}, [selectedFields])

	const toggleField = useCallback((field: keyof SelectedFields) => {
		setSelectedFields((prev) => ({
			...prev,
			[field]: !prev[field],
		}))
	}, [])

	const getEventParams = () => {
		const values = (formValues || {}) as Partial<IProduct>
		const hasStoreInfo = !!store?.description
		const hasStoreName = !!store?.name
		const hasName = !!values.name
		const hasPrice = typeof (values as any).salePrice === 'number'
		const hasCategory = !!values.category
		const hasDescription = !!(values as any).description

		return {
			has_store_info: hasStoreInfo,
			has_store_name: hasStoreName,
			has_name: hasName,
			has_price: hasPrice,
			has_category: hasCategory,
			has_description: hasDescription,
		}
	}
	const handleApply = useCallback(() => {
		const selectedSuggestions: Partial<AISuggestions> = {}
		if (selectedFields.name) selectedSuggestions.name = aiSuggestions.name
		if (selectedFields.salePrice) selectedSuggestions.salePrice = Number(aiSuggestions.salePrice)
		if (selectedFields.category) selectedSuggestions.category = aiSuggestions.category
		if (selectedFields.description) selectedSuggestions.description = aiSuggestions.description

		selectedSuggestions.image = route.params.productImage

		const acceptedFields: string[] = []
		if (selectedFields.name && aiSuggestions.name) acceptedFields.push('name')
		if (selectedFields.salePrice) acceptedFields.push('salePrice')
		if (selectedFields.category && aiSuggestions.category) acceptedFields.push('category')
		if (selectedFields.description && aiSuggestions.description) acceptedFields.push('description')

		logEvent('Product AI Autofill From Image Accept', {
			...getEventParams(),
			accepted_fields: acceptedFields,
			confidence_level_name: (aiSuggestions as any)?.confidenceLevelName,
		})

		setAISuggestionsApplied(true)
		clearAIProductSuggestions()

		// Reset back to ProductDetail with applied suggestions
		const targetRouteKey = route.params?.parentRouteKey
		navigation.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [
					{
						name: 'ProductDetail',
						...(targetRouteKey ? { key: targetRouteKey } : {}),
						params: { appliedAISuggestions: selectedSuggestions },
					},
				],
			})
		)
	}, [
		selectedFields,
		aiSuggestions,
		navigation,
		route.params.productImage,
		clearAIProductSuggestions,
		setAISuggestionsApplied,
	])

	const handleDiscard = useCallback(() => {
		logEvent('Product AI Autofill From Image Reject', {
			...getEventParams(),
			confidence_level_name: aiSuggestions?.confidenceLevelName,
		})
		setTimeout(() => {
			clearAIProductSuggestions()
		}, 500)
		navigation.goBack()
	}, [navigation, clearAIProductSuggestions, aiSuggestions])

	const renderSuggestionItem = useCallback(
		(label: string, value: string | null, field: keyof SelectedFields) => {
			if (!value) return null

			const isSelected = selectedFields[field]
			const existingCategory = categories.some((category: ICategory) => category.id === aiSuggestions.category.id)
			const isNewCategory = field === 'category' && !existingCategory

			return (
				<TouchableOpacity
					onPress={() => toggleField(field)}
					style={{
						backgroundColor: colors.white,
						paddingLeft: 16,
						paddingRight: 32,
						paddingVertical: 12,
						flexDirection: 'row',
						alignItems: field === 'description' ? 'flex-start' : 'center',
					}}
					{...generateTestID(`ai-suggestion-${field}`)}
				>
					<Checkbox
						active={isSelected}
						onPress={() => toggleField(field)}
						checkboxProps={{ marginRight: 12, alignSelf: 'flex-start' }}
					/>
					{field === 'description' ? (
						<Container>
							<KyteText size={14} weight="600" color={colors.gray02Kyte}>
								{label}:
							</KyteText>
							<KyteText size={14} color={colors.gray02Kyte} lineHeight={21}>
								{value}
							</KyteText>
						</Container>
					) : (
						<KyteText size={14} color={colors.gray02Kyte} lineHeight={21}>
							<KyteText size={14} weight="600" color={colors.gray02Kyte}>
								{label}:{' '}
							</KyteText>
							{value}
						</KyteText>
					)}
					{isNewCategory && (
						<Tag
							backgroundColor={colors.green07}
							borderRadius={16}
							textSize={11}
							textColor={colors.green00}
							style={{ marginLeft: 8, fontWeight: 500 }}
						>
							{Strings.t_new}
						</Tag>
					)}
				</TouchableOpacity>
			)
		},
		[selectedFields, toggleField]
	)

	return (
		<KyteScreen
			navigation={navigation}
			title={Strings.t_title}
			backgroundColor={colors.white}
			headerProps={{
				borderBottom: 1,
				innerPage: true,
				goBack: () => {
					navigation.goBack()
					clearAIProductSuggestions()
				},
			}}
		>
			<ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
				<Container padding={16}>
					{/* Product Image */}
					{route.params.productImage && (
						<Margin top={40} style={{ alignItems: 'center' }}>
							<Image
								source={{ uri: route.params.productImage }}
								style={{ width: 80, height: 80, borderRadius: 8 }}
								resizeMode="cover"
							/>
						</Margin>
					)}

					{/* Product Name */}
					<Margin vertical={12}>
						<KyteText size={22} weight="600" color={colors.gray02Kyte} textAlign="center">
							{aiSuggestions.name}
						</KyteText>
					</Margin>

					{/* Subtitle */}
					<KyteText size={16} color={colors.gray02Kyte} lineHeight={24} textAlign="center" marginBottom={4}>
						{Strings.t_subtitle}
					</KyteText>

					{/* Suggestions List */}
					<Container>
						{renderSuggestionItem(Strings.t_name, aiSuggestions.name, 'name')}
						{renderSuggestionItem(
							Strings.t_price,
							formatCurrencyValue(aiSuggestions.salePrice, currency, decimalCurrency),
							'salePrice'
						)}
						{renderSuggestionItem(Strings.t_category, aiSuggestions.category?.name, 'category')}
						{renderSuggestionItem(Strings.t_description, aiSuggestions.description, 'description')}
					</Container>

					{/* Disclaimer Alert */}
					<Container paddingHorizontal={16} paddingVertical={8}>
						<Container backgroundColor={colors.black4} padding={16} borderRadius={8}>
							<Row alignItems="center">
								<KyteIcon name="warning" size={20} color={colors.gray02Kyte} />
								<KyteText size={11} lineHeight={16} color={colors.gray02Kyte} style={{ marginLeft: 12 }}>
									{Strings.t_ai_disclaimer}
								</KyteText>
							</Row>
						</Container>
					</Container>
				</Container>
			</ScrollView>

			{/* Action Buttons */}
			<Container padding={16} borderTopWidth={1} borderColor={colors.black4}>
				<Row>
					<KyteButton
						onPress={handleDiscard}
						type="secondary"
						containerStyle={{ flex: 0.3 }}
						borderRadius={8}
						borderColor={colors.black80}
						{...generateTestID('ai-discard-btn')}
					>
						<KyteText size={16} weight="500" color={colors.gray02Kyte}>
							{Strings.t_discard}
						</KyteText>
					</KyteButton>

					<Margin left={10} />

					<KyteButton
						onPress={handleApply}
						type="primary"
						disabledButton={shouldDisableButton}
						containerStyle={{ flex: 0.7, borderWidth: 0 }}
						borderRadius={8}
						{...generateTestID('ai-apply-btn')}
					>
						<KyteText size={16} weight="500" color={colors.white}>
							{Strings.t_apply}
						</KyteText>
					</KyteButton>
				</Row>
			</Container>
		</KyteScreen>
	)
}

export default connect(mapStateToProps, mapDispatchToProps)(AIProductIdentified)
