import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Field, isValid, InjectedFormProps, FormErrors, getFormValues } from 'redux-form'
import { Container, Padding, Body13, Body14, RadioCircle, Row } from '@kyteapp/kyte-ui-components'
import { NavigationProp } from '@react-navigation/native'
import { CustomKeyboardAvoidingView, DetailPage, WizardProgressBar } from '../../../common'
import { colors } from '../../../../styles'
import FieldInput from '../../../common/form/FieldInput'
import KyteBaseButton from '../../../common/buttons/KyteBaseButton'
import {
	CONTENT_SPACING,
	VARIANT_CREATE_FORM_NAME,
	createVariantForm,
	VariantCreateFormValues,
} from './createVariantForm'
import { IVariantsState } from '../../../../stores/variants/variants.types'
import { generateTestID } from '../../../../util'
import I18n from '../../../../i18n/i18n'
import StepCounter from '../../../common/StepCounter'
import { VariantsScreens } from '../../../../enums/Screens'
import { logEvent } from '../../../../integrations'

interface VariantCreateProps {
	navigation: NavigationProp<any>
	variantFormValues?: VariantCreateFormValues
	isValid?: boolean
	wizard: IVariantsState['wizard']
	variantsList: IVariantsState['list']
}

type Props = VariantCreateProps & InjectedFormProps<VariantCreateFormValues, VariantCreateProps>

const Strings = {
	t_title: I18n.t('variantsList.createTitle'),
	t_validation_name: I18n.t('variantsList.validationName'),
	t_name_placeholder: I18n.t('variantsList.namePlaceholder'),
	t_proceed: I18n.t('words.s.continue'),
	t_input_title: I18n.t('variantsList.createInputTitle'),
	t_variation_exists: I18n.t('variantsList.variationExists'),
}

const VariantCreateComponent: React.FC<Props> = ({ navigation, handleSubmit, isValid, wizard }) => {
	const containerStyle = { flex: 1 }
	const { chosenVariations } = wizard
	const existingVariation = chosenVariations?.length && chosenVariations?.[0]

	useEffect(() => {
		logEvent("New Variation View", { where: "product" })
	}, [])

	const onSubmit = () => {
		if (!isValid) return
		navigation.navigate(VariantsScreens.VariantOptionsCreate)
	}

	return (
		<DetailPage
			goBack={navigation.goBack}
			navigate={navigation.navigate}
			navigation={navigation}
			pageTitle={Strings.t_title}
			rightComponent={<StepCounter currentStep={1} totalSteps={2} />}
		>
			<CustomKeyboardAvoidingView style={containerStyle}>
				<Container style={containerStyle}>
					<WizardProgressBar currentStep={1} totalSteps={3} />
					<Container flex={1}>
						<Padding all={CONTENT_SPACING}>
							<Padding bottom={10}>
								{!existingVariation ? <Body13 weight={500}>{Strings.t_input_title}</Body13> : null}
								{existingVariation ? (
									<Row alignItems="center">
										<RadioCircle active />
										<Padding left={CONTENT_SPACING}>
											<Body14>{existingVariation.name}</Body14>
										</Padding>
									</Row>
								) : null}
							</Padding>
							<Field
								autoFocus
								autoCorrect
								placeholder={Strings.t_name_placeholder}
								placeholderColor={colors.primaryGrey}
								name="name"
								component={FieldInput}
								maxLength={25}
								testProps={generateTestID(existingVariation ? ' input-name-vt' : 'input-name-first-vt')}
							/>
						</Padding>
					</Container>
					<Padding all={CONTENT_SPACING}>
						<KyteBaseButton
							{...generateTestID('next-wizard-step-1-vts')}
							onPress={handleSubmit(onSubmit)}
							disabled={isValid}
							type={isValid ? 'primary' : 'tertiary'}
						>
							{Strings.t_proceed}
						</KyteBaseButton>
					</Padding>
				</Container>
			</CustomKeyboardAvoidingView>
		</DetailPage>
	)
}

const validate = (values: VariantCreateFormValues, props: Props) => {
	const errors: FormErrors<VariantCreateFormValues> = {}
	// Validate if name is empty
	if (!values.name) {
		errors.name = Strings.t_validation_name
	}
	// Validate if name already exists
	const { variantsList } = props
	const variantsListNames = variantsList.map((variant) => variant.name.toLowerCase()?.trim())
	const variantNameExists = variantsListNames.includes(values.name?.toLowerCase()?.trim())

	if (variantNameExists) {
		errors.name = Strings.t_variation_exists
	}

	return errors
}

const VariantCreate = createVariantForm(VARIANT_CREATE_FORM_NAME, VariantCreateComponent as any, validate)

const mapStateToProps = (state: any) => ({
	isValid: isValid(VARIANT_CREATE_FORM_NAME)(state),
	variantFormValues: getFormValues(VARIANT_CREATE_FORM_NAME)(state),
	wizard: state.variants?.wizard,
	variantsList: state.variants.list,
})

export default connect(mapStateToProps, null)(VariantCreate)
