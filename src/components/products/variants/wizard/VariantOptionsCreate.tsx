import React, { useEffect, useCallback, useMemo } from 'react'
import { Keyboard, ScrollView, TouchableWithoutFeedback } from 'react-native'
import { Container, Padding, Body13 } from '@kyteapp/kyte-ui-components'
import { CustomKeyboardAvoidingView, DetailPage, WizardProgressBar } from '../../../common'
import { NavigationProp } from '@react-navigation/native'

import { connect } from 'react-redux'
import { getFormValues, InjectedFormProps } from 'redux-form'
import KyteBaseButton from '../../../common/buttons/KyteBaseButton'
import {
	checkOptionsActive,
	checkOptionsWithoutTitle,
	checkOptionsWithSameName,
	CONTENT_SPACING,
	createVariantForm,
	OPTIONS_CREATE_FORM_NAME,
	VARIANT_CREATE_FORM_NAME,
	VariantCreateFormValues,
} from './createVariantForm'
import ContentLabel from '../../../common/content/ContentLabel'
import AddEntryButton from '../../../common/buttons/AddEntryButton'
import {
	setWizardVariation,
	setSKUsGenerationLimit,
} from '../../../../stores/variants/actions/wizard-variation.actions'
import { IVariant, IVariantOption, IVariantsState } from '../../../../stores/variants/variants.types'
import { IAuthState } from '../../../../types/state/auth'
import { generateTestID } from '../../../../util'
import Warning from '../../../common/content/Warning'
import I18n from '../../../../i18n/i18n'
import { useKeyboardSubmit } from '../../../../hooks/use-keyboard-submit'
import VariantOptionsItem from './components/VariantOptionsItem'
import { RootState } from '../../../../types/state/RootState'
import useKeyboardStatus from '../../../../hooks/useKeyboardStatus'
import StepCounter from '../../../common/StepCounter'
import { VariantsScreens } from '../../../../enums/Screens'
import { logEvent } from '../../../../integrations'

interface VariantOptionsCreateProps {
	navigation: NavigationProp<any>
	optionsFormValues?: VariantCreateFormValues
	variantFormValues?: VariantCreateFormValues
	setWizardVariation: typeof setWizardVariation
	setSKUsGenerationLimit: typeof setSKUsGenerationLimit
	nonEditableOptionsIds: IVariantOption['id'][]
	auth: IAuthState
	wizard: IVariantsState['wizard']
	list: IVariantsState['list']
}

type Props = VariantOptionsCreateProps & InjectedFormProps<VariantCreateFormValues, VariantOptionsCreateProps>

const Strings = {
	t_title: I18n.t('variantsWizard.createVariant.title'),
	t_variant_name: I18n.t('variantsWizard.variantName'),
	t_input_title: I18n.t('variantsWizard.createVariant.inputTitle'),
	t_proceed: I18n.t('words.s.continue'),
	t_create_new: I18n.t('variantsList.createNew'),
	t_alert_title: I18n.t('words.s.attentionAlert'),
	t_alert_message: I18n.t('variantsWizard.createVariant.alertMessage'),
}

const VariantOptionsCreateComponent: React.FC<Props> = ({
	navigation,
	handleSubmit,
	change,
	untouch,
	reset,
	initialValues,
	optionsFormValues,
	variantFormValues,
	setWizardVariation,
	setSKUsGenerationLimit,
	auth,
	wizard,
	nonEditableOptionsIds,
}) => {
	const isKeyboardOpen = useKeyboardStatus()
	const { skusGenerationLimit, selected, chosenVariations = [] } = wizard
	const containerStyle = { flex: 1 }
	const currentOptions = optionsFormValues?.options || initialValues?.options || []
	const name = variantFormValues?.name || initialValues?.name || ''
	const scrollRef = React.useRef<ScrollView>(null)
	const optionsWithoutTitle = checkOptionsWithoutTitle(currentOptions)
	const isAddDisabled =
		skusGenerationLimit.isOffLimit || optionsWithoutTitle || checkOptionsWithSameName(currentOptions)
	const isProceedDisabled = isAddDisabled || !checkOptionsActive(currentOptions)?.length

	// Updating the limit of SKUs that can be generated
	useEffect(() => {
		setSKUsGenerationLimit(String(selected?.variant?._id || selected?.variant?.id), checkOptionsActive(currentOptions))
	}, [currentOptions])

	// Add initial option to the form
	useEffect(() => {
		if (!currentOptions.length) {
			change('options', [{ title: '', id: 0, active: true, isFocused: true }])
		}
	}, [])

	// unFocus options on keyboard dismiss
	useEffect(() => {
		if (!isKeyboardOpen) {
			const updatedOptions = currentOptions.map((option) => ({ ...option, isFocused: false }))
			change('options', updatedOptions)
		}
	}, [isKeyboardOpen])

	// FormState: Toggles the active state of the option
	const toggleVariantOption = useCallback(
		(option: IVariantOption) => {
			let variations: IVariant[] = [];
			const wasSelectedVariantChosen = chosenVariations.some((variation) => variation.id === selected?.variant.id)
			
			if(wasSelectedVariantChosen){
				variations = [...chosenVariations]
			} else {
				variations = [...chosenVariations, ...(selected?.variant ? [selected.variant] : [])]
			}
			logEvent("Product Variation Option Selected", { definedVariations: variations.length })

			const updatedOptions = currentOptions.map((opt) => (opt.id === option.id ? { ...opt, active: !opt.active } : opt))
			change('options', updatedOptions)
		},
		[currentOptions, change]
	)

	// FormState: Removes an option from the currentOptions array
	const removeVariantOption = useCallback(
		(option: IVariantOption) => {
			const updatedOptions = currentOptions.filter((currentOption) => currentOption.id !== option.id)
			change('options', updatedOptions)
		},
		[currentOptions, change]
	)

	// FormState: Adds a new option to the currentOptions array
	const addOptionInForm = (values: VariantCreateFormValues) => {
		const randomId = Math.floor(Math.random() * 90000) + 10000
		const title = values?.optionField?.trim()
		const addedOption = [...currentOptions, { title, id: randomId, active: true, isFocused: true }]
		return addedOption
	}

	// FormState: Edit option title
	const editOptionTitle = useCallback(
		(option: IVariantOption, title: string) => {
			const updatedOptions = currentOptions.map((opt) =>
				opt.id === option.id ? { ...opt, title, isTouched: true } : opt
			)
			change('options', updatedOptions)
		},
		[currentOptions, change]
	)

	// FormState: Set the option focus
	const setOptionFocus = useCallback(
		(option: IVariantOption, isFocused: boolean) => {
			const updatedOptions = currentOptions.map((opt) => (opt.id === option.id ? { ...opt, isFocused } : opt))
			change('options', updatedOptions)
		},
		[currentOptions, change]
	)

	// FormState: Submits the option to the form
	const onSubmit = (values: VariantCreateFormValues) => {
		if (isAddDisabled) return
		const addedOption = addOptionInForm(values)

		change('options', addedOption)
		change('optionField', '')
		untouch('optionField')
		scrollRef.current?.scrollToEnd({ animated: true })
	}

	// Clears the last option if it is blank
	const clearBlankOption = (optionIndex: number) => {
		if (currentOptions?.length - 1 === optionIndex) {
			const filteredOptions = currentOptions.filter(
				(option, index) => index !== currentOptions.length - 1 || !!option.title
			)
			change('options', filteredOptions)
		}
	}

	// Adds variant with options to reducer and navigates to the next screen
	const goToVariantSetup = (values: VariantCreateFormValues) => {
		if (isProceedDisabled) return
		const variant: IVariant = {
			...wizard?.selected?.variant,
			aid: auth?.aid,
			uid: auth?.user?.uid,
			name,
			options: currentOptions,
		}

		// Set wizard variation and navigate to the setup screen
		setWizardVariation(variant)
		navigation.navigate(VariantsScreens.VariantsCreationSetup)
	}

	// Submit form when "done" button is pressed on the keyboard
	const { submitProps } = useKeyboardSubmit(
		handleSubmit((values) => {
			onSubmit(values)
			// Timeout to clear the input field after submitting
			setTimeout(() => change('optionField', ''), 100)
		}),
		{ enabled: true, dismissKeyboardOnSubmit: true }
	)

	const renderOptionsMap = useMemo(
		() =>
			optionsFormValues?.options?.map((option, index) => (
				<VariantOptionsItem
					typeName={name}
					key={option.id}
					option={option}
					currentOptions={currentOptions}
					index={index}
					onToggle={toggleVariantOption}
					onRemove={removeVariantOption}
					onEditTitle={editOptionTitle}
					onFocusChange={setOptionFocus}
					handleBlur={() => clearBlankOption(index)}
					editable={!option.id || !nonEditableOptionsIds.includes(option.id)}
					isNewOption={!option.id || !nonEditableOptionsIds.includes(option.id)}
				/>
			)),
		[
			optionsFormValues?.options,
			currentOptions,
			toggleVariantOption,
			removeVariantOption,
			editOptionTitle,
			setOptionFocus,
		]
	)

	useEffect(() => {
		logEvent("Product Variations Option Select View", { where: "product" })
	}, [])

	useEffect(() => {
		if(skusGenerationLimit.isAtLimit || skusGenerationLimit.isOffLimit){
			logEvent("Variation Options Limit Reached")
		}
	}, [skusGenerationLimit.isAtLimit, skusGenerationLimit.isOffLimit])

	return (
		<DetailPage
			goBack={navigation.goBack}
			navigate={navigation.navigate}
			navigation={navigation}
			pageTitle={Strings.t_title}
			rightComponent={<StepCounter currentStep={2} totalSteps={2} />}
		>
			<CustomKeyboardAvoidingView keyboardShouldPersistTaps="always" style={containerStyle}>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<Container style={containerStyle}>
						<WizardProgressBar currentStep={2} totalSteps={3} />
						<Container flex={1}>
							<ScrollView ref={scrollRef} keyboardShouldPersistTaps="always">
								<Padding top={CONTENT_SPACING} horizontal={CONTENT_SPACING} bottom={CONTENT_SPACING * 4}>
									<Padding bottom={CONTENT_SPACING}>
										<ContentLabel
											testID={generateTestID('name-first-vt')}
											label={Strings.t_variant_name}
											title={name}
											icon="check-in-filled"
										/>
									</Padding>
									<Padding bottom={10}>
										<Body13 weight={500}>{Strings.t_input_title}</Body13>
									</Padding>
									{renderOptionsMap}
									<Padding top={10} />
									<AddEntryButton
										onPress={handleSubmit(onSubmit)}
										title={Strings.t_create_new}
										isDisabled={isAddDisabled}
									/>
								</Padding>
							</ScrollView>
						</Container>
					</Container>
				</TouchableWithoutFeedback>
			</CustomKeyboardAvoidingView>
			{!isKeyboardOpen && (
				<Padding horizontal={CONTENT_SPACING} bottom={CONTENT_SPACING}>
					{skusGenerationLimit.isAtLimit || skusGenerationLimit.isOffLimit ? (
						<Warning title={Strings.t_alert_title} message={Strings.t_alert_message} />
					) : null}
					<Padding top={10} />
					<KyteBaseButton
						{...generateTestID('next-wizard-step-2-vts')}
						onPress={optionsFormValues?.optionField ? handleSubmit(goToVariantSetup) : goToVariantSetup}
						type={isProceedDisabled ? 'tertiary' : 'primary'}
					>
						{Strings.t_proceed}
					</KyteBaseButton>
				</Padding>
			)}
		</DetailPage>
	)
}

const VariantOptionsCreate = createVariantForm(OPTIONS_CREATE_FORM_NAME, VariantOptionsCreateComponent)

const mapStateToProps = (state: RootState) => {
	const { variants, auth }: { variants: IVariantsState; auth: IAuthState } = state
	const nonEditableOptionsIds: (string | number)[] = []
	const selectedVariant = variants?.wizard?.selected?.variant
	const variantKey = selectedVariant?._id || variants?.wizard?.selected?.variant?.id

	if (variantKey) {
		const variant = variants?.list?.find?.((variant) => [variant._id, variant.id].includes(variantKey))

		selectedVariant?.options.forEach((option) => {
			const isAlreadyCreated = variant?.options.some((variantOption) => variantOption.title === option.title)

			if (isAlreadyCreated && option.id) nonEditableOptionsIds.push(option.id)
		})
	}

	return {
		optionsFormValues: getFormValues(OPTIONS_CREATE_FORM_NAME)(state),
		variantFormValues: getFormValues(VARIANT_CREATE_FORM_NAME)(state),
		wizard: variants?.wizard,
		initialValues: variants?.wizard?.selected?.variant,
		nonEditableOptionsIds,
		auth: auth,
		list: variants?.list,
	}
}

export default connect(mapStateToProps, { setWizardVariation, setSKUsGenerationLimit })(VariantOptionsCreate as any)
