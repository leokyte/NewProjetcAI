import React, { useEffect } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { NavigationProp } from '@react-navigation/native'
import { InjectedFormProps } from 'redux-form'
import { Row, Padding, Body12, Body13, Body14, RadioCircle, Container } from '@kyteapp/kyte-ui-components'
import { DetailPage, WizardProgressBar } from '../../../common'
import { IVariant, IVariantsState } from '../../../../stores/variants/variants.types'
import { generateTestID } from '../../../../util'
import { CONTENT_SPACING, VariantCreateFormValues } from './createVariantForm'
import AddEntryButton from '../../../common/buttons/AddEntryButton'
import KyteBaseButton from '../../../common/buttons/KyteBaseButton'
import { setWizardSelectedVariant } from '../../../../stores/variants/actions/wizard-variation.actions'
import I18n from '../../../../i18n/i18n'
import StepCounter from '../../../common/StepCounter'
import { VariantsScreens } from '../../../../enums/Screens'
import { logEvent } from '../../../../integrations'

interface VariantsListsProps {
	variants: IVariantsState
	navigation: NavigationProp<any>
	setWizardSelectedVariant: typeof setWizardSelectedVariant
}

type Props = VariantsListsProps & InjectedFormProps<VariantCreateFormValues, VariantsListsProps>

const Strings = {
	t_select_variation: I18n.t('variantsList.selectPlaceholder'),
	t_title: I18n.t('variantsList.chooseTitle'),
	t_description: I18n.t('variantsList.chooseDescription'),
	t_name_placeholder: I18n.t('variantsList.namePlaceholder'),
	t_validation_name: I18n.t('variantsList.validationName'),
	t_create_new: I18n.t('variantsList.createNew'),
	t_proceed: I18n.t('words.s.continue'),
}

const VariantsListsComponent: React.FC<Props> = ({ variants, navigation, setWizardSelectedVariant }) => {
	const containerStyle = { flex: 1 }
	const { list = [], wizard } = variants
	const { chosenVariations = [] } = wizard
	const variantSelected = wizard.selected?.variant
	const alreadyAddedVariants = (variant: IVariant) => Boolean(chosenVariations.find((v) => v?._id === variant._id))
	const isVariantActive = (variant: IVariant) => variantSelected && variantSelected._id === variant._id

	const handleProceed = () => {
		if (!variantSelected) return
		navigation.navigate(VariantsScreens.VariantOptionsEdit)
	}

	const handleSelectVariant = (variant: IVariant) => {
		logEvent("Product Variation Selected", { definedVariations: chosenVariations.length + 1 })
		if (alreadyAddedVariants(variant)) return
		const options = variant?.options.map((option) => ({
			...option,
			active: true,
			id: option.id || String(Math.floor(Math.random() * 90000) + 10000),
		}))
		setWizardSelectedVariant({ ...variant, options })
	}

	const handleCreateNewVariant = () => {
		setWizardSelectedVariant(undefined)
		navigation.navigate(VariantsScreens.VariantCreate)
	}

	useEffect(() => {
		logEvent("Product Variations Select View", { definedVariations: chosenVariations.length })
	}, [])

	return (
		<DetailPage
			goBack={navigation.goBack}
			navigate={navigation.navigate}
			navigation={navigation}
			pageTitle={Strings.t_select_variation}
			rightComponent={<StepCounter currentStep={1} totalSteps={2} />}
		>
			<Container style={containerStyle}>
				<WizardProgressBar currentStep={1} totalSteps={3} />
				<ScrollView style={containerStyle}>
					<Padding top={CONTENT_SPACING} horizontal={CONTENT_SPACING}>
						<Body13 weight={500}>{Strings.t_title}</Body13>
						<Padding vertical={15}>
							<Body12 {...generateTestID('text-wizard-step-1-vts')} lineHeight={16}>
								{Strings.t_description}
							</Body12>
						</Padding>
						{list.map((variant) => (
							<TouchableOpacity
								disabled={alreadyAddedVariants(variant)}
								key={variant.id}
								onPress={() => handleSelectVariant(variant)}
							>
								<Padding vertical={CONTENT_SPACING / 1.5}>
									<Row alignItems="center">
										<RadioCircle
											disabled={alreadyAddedVariants(variant)}
											active={isVariantActive(variant) || alreadyAddedVariants(variant)}
										/>
										<Padding left={CONTENT_SPACING}>
											<Body14>{variant.name}</Body14>
										</Padding>
									</Row>
								</Padding>
							</TouchableOpacity>
						))}
					</Padding>
					<Padding left={8.5}>
						<AddEntryButton onPress={handleCreateNewVariant} title={Strings.t_create_new} />
					</Padding>
				</ScrollView>
				<Padding bottom={CONTENT_SPACING} horizontal={CONTENT_SPACING}>
					<KyteBaseButton
						{...generateTestID('next-wizard-step-1-vts')}
						onPress={handleProceed}
						type={variantSelected ? 'primary' : 'tertiary'}
					>
						{Strings.t_proceed}
					</KyteBaseButton>
				</Padding>
			</Container>
		</DetailPage>
	)
}

const mapStateToProps = (state: any) => ({
	variants: state.variants,
})

export default connect(mapStateToProps, { setWizardSelectedVariant })(VariantsListsComponent)
