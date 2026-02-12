import React, { ComponentProps, useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Alert } from 'react-native'
import {
	Container,
	Center,
	Padding,
	Body18,
	Body16,
	Row,
	Margin,
	KyteText,
	IconButton,
} from '@kyteapp/kyte-ui-components'
import { DetailPage } from '../../../common'
import { NavigationProp, StackActions } from '@react-navigation/native'

import VariantExampleIllustration from '../../../../../assets/images/variants/variants-example'
import VariantsExampleFirstStepIllustration from '../../../../../assets/images/variants/variants-example-first-step'
import VariantsExampleCompletedIllustration from '../../../../../assets/images/variants/variants-example-completed'

import { colors } from '../../../../styles'
import { generateTestID, renderBoldText } from '../../../../util'
import ListTileWithButton from '../../../common/buttons/ListTileWithButton'
import {
	checkOptionsActive,
	CONTENT_SPACING,
	createVariantForm,
	VARIANT_CREATE_FORM_NAME,
	OPTIONS_CREATE_FORM_NAME,
	VariantCreateFormValues,
	WIZARD_IMAGE_SIZE,
} from './createVariantForm'
import { connect } from 'react-redux'
import { getFormValues, InjectedFormProps, destroy } from 'redux-form'
import { IVariant, IVariantsState } from '../../../../stores/variants/variants.types'
import LabelButton from '../../../common/buttons/LabelButton'
import {
	setWizardSelectedVariant,
	removeWizardVariation,
	removeWizardVariationOption,
	resetWizardVariation,
	setVariantsNotification,
	setSKUsGenerationLimit,
} from '../../../../stores/variants/actions/wizard-variation.actions'
import { productDetailUpdate, toggleBillingMessage } from '../../../../stores/actions'
import { generateProductSKUs, getVariations } from '../../../../stores/variants/actions/wizard-variation.async.actions'
import KyteBaseButton from '../../../common/buttons/KyteBaseButton'
import RequiredProductFieldsModal from '../../modals/RequiredProductFields'
import { IBilling, IProduct, isBetaCatalog, isGrow, isPrime } from '@kyteapp/kyte-utils'
import { IAuthState } from '../../../../types/state/auth'
import { buildProductRequiredFields, IProductManaging } from '../../../../util/products/util-create'
import VariantLoader from './components/VariantLoader'
import { Features, ProductWithVariationDetailsTabKeys, VariantsScreens } from '../../../../enums'
import KyteNotifications from '../../../common/KyteNotifications'
import I18n from '../../../../i18n/i18n'
import SecondVariantPayWallLabel from './components/SecondVariantPayWallLabel'
import { checkShouldShowCatalogVersionWarning, getActiveOptionsCount } from '../../../../util/products/util-variants'
import CatalogVersionWarning from './components/CatalogVersionWarning'
import { logEvent } from '../../../../integrations'
import NavigationService from '../../../../services/kyte-navigation'
import useWizardExitFlag from '../../../../hooks/useWizardExitFlag'

type TStringObjectKey = 'completedSteps' | 'existingVariation' | 'default'

const Strings = {
	t_title: I18n.t('variantsList.title'),
	t_subtitle: I18n.t('variantsList.subtitle'),
	t_add_variant: I18n.t('variantsList.addVariant'),
	t_add_option: I18n.t('variantsList.addOption'),
	t_description: I18n.t('variantsList.description'),
	t_up_to_two: I18n.t('variantsList.upToTwo'),
	t_up_to_two_description: I18n.t('variantsList.upToTwoDescription'),
	t_completed: (quantity: number) => I18n.t('variantsList.completed', { quantity }),
	t_completed_description: I18n.t('variantsList.completedDescription'),
	t_generate_itens: I18n.t('variantsList.generateItems'),
	t_back_button: I18n.t('words.s.back'),
	t_unsaved_changes_title: I18n.t('words.s.attention'),
	t_unsaved_changes_description: I18n.t('variantsWizard.discardChangesAlert.description'),
	t_discard: I18n.t('leaveAnyway'),
	t_stay: I18n.t('alertDismiss'),
}

interface VariantsCreationSetupProps {
	navigation: NavigationProp<any>
	variants: IVariantsState
	productFormValues: Partial<IProduct>
	auth: IAuthState
	productManaging: IProductManaging
	notifications: IVariantsState['notifications']
	billing: IBilling
	setWizardSelectedVariant: typeof setWizardSelectedVariant
	generateProductSKUs: typeof generateProductSKUs
	getVariations: typeof getVariations
	removeWizardVariation: typeof removeWizardVariation
	removeWizardVariationOption: typeof removeWizardVariationOption
	resetWizardVariation: typeof resetWizardVariation
	productDetailUpdate: typeof productDetailUpdate
	setVariantsNotification: typeof setVariantsNotification
	setSKUsGenerationLimit: typeof setSKUsGenerationLimit
	toggleBillingMessage: typeof toggleBillingMessage
	destroyOptionsForm: () => void
}

type Props = VariantsCreationSetupProps & InjectedFormProps<VariantCreateFormValues, VariantsCreationSetupProps>

const VariantsCreationSetupComponent: React.FC<Props> = ({
	navigation,
	variants,
	productFormValues,
	auth,
	productManaging,
	billing,
	reset,
	setWizardSelectedVariant,
	generateProductSKUs,
	getVariations,
	removeWizardVariation,
	removeWizardVariationOption,
	resetWizardVariation,
	productDetailUpdate,
	setSKUsGenerationLimit,
	toggleBillingMessage,
	...props
}) => {
	const { allowExitRef, allowExit, resetExit } = useWizardExitFlag()
	const [isVisible, setModalVisibility] = useState(false)
	const [isVariationsFetchError, setIsVariationsFetchError] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const containerStyle = { flex: 1 }
	const isGrowOrPrime = useMemo(() => isGrow(billing) || isPrime(billing), [billing])
	const { isCreatingSKUs, chosenVariations = [], skusGenerationLimit } = variants?.wizard
	const { isFetchingList } = variants
	const maxVariations = useMemo(() => (isGrowOrPrime ? 2 : 1), [isGrowOrPrime])
	const existingVariation = useMemo(() => Boolean(chosenVariations.length), [chosenVariations])
	const completedSteps = useMemo(
		() => Boolean(chosenVariations.length === maxVariations),
		[chosenVariations, maxVariations]
	)
	const keys: TStringObjectKey = useMemo(
		() => (completedSteps ? 'completedSteps' : existingVariation ? 'existingVariation' : 'default'),
		[completedSteps]
	)
	const hasRegisteredVariations = variants?.list?.length
	const addButtonsArray = Array.from({ length: maxVariations - chosenVariations.length })
	const chosenVariationsHasNoActiveOptions = chosenVariations.some(
		(variation) => !variation?.options.some((option) => option?.active)
	)
	const isProceedDisabled = chosenVariationsHasNoActiveOptions
	const { catalog } = auth.store
	const shouldRenderCatalogVersionWarning = checkShouldShowCatalogVersionWarning(catalog)

	const notifications = useMemo(() => {
		const notificationWithHandler = props?.notifications?.map((notification) => ({
			...notification,
			handleClose: () => props?.setVariantsNotification([]), // TODO: remove clicked one, instead everything
		}))

		return notificationWithHandler
	}, [props?.notifications])

	const getAccountVariations = useCallback(() => {
		getVariations(auth?.aid, (error) => {
			if (Boolean(error)) {
				setIsVariationsFetchError(true)
				return
			}
			if (isVariationsFetchError && !error) {
				setIsVariationsFetchError(false)
				goToVariantCreate(true)
				return
			}
		})
	}, [getVariations, isVariationsFetchError])

	// Maps the subtitle and description based on the current state of the wizard
	const subtitleAndDescriptioMap = useMemo(() => {
		type Terms = { subtitle: string; description: string; testID: string }
		// TODO: use global state variants.skusGenerationLimit.current(make sure always up to date)

		const quantity = getActiveOptionsCount(chosenVariations)

		const stringsObject: { [key in TStringObjectKey]: Terms } = {
			default: {
				subtitle: Strings.t_subtitle,
				description: Strings.t_description,
				testID: 'text-first-vts',
			},
			existingVariation: {
				subtitle: Strings.t_up_to_two,
				description: Strings.t_up_to_two_description,
				testID: 'text-second-vts',
			},
			completedSteps: {
				subtitle: Strings.t_completed(quantity),
				description: Strings.t_completed_description,
				testID: 'text-third-vts',
			},
		}
		return stringsObject[keys]
	}, [chosenVariations])

	// Maps the illustration based on the current state of the wizard
	const illustrationMap = () => {
		const illustrations = {
			default: VariantExampleIllustration,
			existingVariation: VariantsExampleFirstStepIllustration,
			completedSteps: VariantsExampleCompletedIllustration,
		}
		return illustrations[keys]
	}

	const rightButtons: ComponentProps<typeof DetailPage>['rightButtons'] = [
		{
			icon: 'tip',
			onPress: () => navigation.navigate(VariantsScreens.ProductVariantTips),
			iconSize: 38,
			testProps: generateTestID('modal-variations-vts'),
		},
	]

	const submitProductSKUsGenerator = () => {
		// Prevent multiple submissions
		if (isSubmitting || isProceedDisabled) return

		setIsSubmitting(true)
		logEvent('Product Variants Generate')
		// If the steps are completed, navigate to the main variant choose screen
		if (completedSteps && maxVariations > 1) {
			setIsSubmitting(false)
			return navigation.navigate(VariantsScreens.VariantChooseMain)
		}

		// If the required fields are not filled, show the required fields modal
		const requiredFields = productFormValues?.name && productFormValues?.salePrice
		if (!requiredFields) {
			setIsSubmitting(false)
			return setModalVisibility(true)
		}

		// Call the API to save variations amd generate product SKUs
		// Adding the required fields to save the product
		const normalizedProduct = buildProductRequiredFields(productFormValues, productManaging, auth)
		generateProductSKUs(chosenVariations, normalizedProduct, (error, persistedProduct) => {
			setIsSubmitting(false)
			if (error) return

			productDetailUpdate(persistedProduct, ProductWithVariationDetailsTabKeys.Variants)
			resetWizardVariation()
			allowExit()
			NavigationService.resetNavigation('ProductDetail')
			// Only reset isSubmitting after successful completion
		})
	}

	// Navigates to the variant create screen and sets the current step (first or second variation)
	const goToVariantCreate = (hasFetchedVariationsList?: boolean) => {
		setWizardSelectedVariant(undefined)
		reset() // Resets VARIANT_CREATE_FORM_NAME
		props.destroyOptionsForm() // Destroys the options form to clear stale state
		const nextScreen =
			hasRegisteredVariations || hasFetchedVariationsList ? VariantsScreens.VariantsList : VariantsScreens.VariantCreate
		navigation.navigate(nextScreen)
	}

	// Set the selected variation and navigate to the variant options edit screen
	const editVariation = (variation: IVariant) => {
		logEvent('Product Variation Option Add Click')
		setWizardSelectedVariant(variation)
		navigation.navigate(VariantsScreens.VariantOptionsEdit)
	}

	// Remove variation option and recount generation limit
	const removeVariationOptions = (variation: IVariant, optionId?: string | number) => {
		removeWizardVariationOption(variation, optionId)
		const currentOptions = variation.options.filter((option) => option?.id !== optionId)
		setSKUsGenerationLimit(String(variation?._id || variation?.id), checkOptionsActive(currentOptions))
	}

	// White container for the variants or empty state
	const variantContainer = (children: React.ReactNode, index?: number) => {
		const slotTestProps = generateTestID(`slot_variation${index != null ? '_' + index : ''}`)

		return (
			<React.Fragment key={index}>
				<Container
					borderRadius={12}
					backgroundColor="white"
					testID={slotTestProps.testID}
					accessibilityLabel={slotTestProps.accessibilityLabel}
				>
					{children}
				</Container>
				<Padding bottom={15} />
			</React.Fragment>
		)
	}

	// Render the add variation button
	const renderAddVariantionButton = (index?: number) => {
		const fetchVariations = () => {
			logEvent('Product Variation Add Click', { where: (index ?? 0) === 0 ? 'first_block' : 'second_block' })
			return isVariationsFetchError ? getAccountVariations() : goToVariantCreate()
		}
		return (
			<ListTileWithButton
				onPress={isFetchingList ? () => null : () => fetchVariations()}
				title={Strings.t_add_variant}
				cornerButtonContent={isFetchingList ? <ActivityIndicator size={'small'} color="white" /> : '+'}
				cornerButtonContentSize={20}
				testID={generateTestID(`add-new-variations${index != null ? index + 1 : ''}`.toLowerCase())}
			/>
		)
	}

	// Render the variations at chosenVariations array
	const renderVariations = (variation: IVariant) => {
		const labelSpacing = 8
		const activeOptions = variation?.options.filter((option) => option?.active)

		return (
			<Padding all={CONTENT_SPACING}>
				<Margin bottom={CONTENT_SPACING}>
					<Row alignItems="center">
						<Container flex={1}>
							<KyteText weight={'500'} size={16}>
								{variation?.name}
							</KyteText>
						</Container>
						{(() => {
							const removeVariationTestProps = generateTestID('remove-variation-vt')
							return (
								<IconButton
									{...removeVariationTestProps}
									testID={removeVariationTestProps.testID}
									onPress={() => {
										removeWizardVariation(variation)
										logEvent('Product Variation Remove')
									}}
									size={12}
									name="close-navigation"
								/>
							)
						})()}
					</Row>
				</Margin>
				<Row style={{ flexWrap: 'wrap' }}>
					{activeOptions.map((option, index) => (
						<Margin bottom={labelSpacing} right={labelSpacing} key={index}>
							<LabelButton
								testID={generateTestID(`remove-option-vt${index}`)}
								onPress={() => {
									removeVariationOptions(variation, option?.id)
									logEvent('Product Variation Option Remove')
								}}
								label={option?.title}
								labelProps={`label_option_slot${index ?? ''}`}
							/>
						</Margin>
					))}
					<LabelButton
						testID={generateTestID('add-option-vt')}
						labelState="empty"
						onPress={() => editVariation(variation)}
						label={Strings.t_add_option}
					/>
				</Row>
			</Padding>
		)
	}

	// Get variations from API when the component mounts
	useEffect(() => {
		resetExit()
		getAccountVariations()
	}, [getAccountVariations, resetExit])

	// Reset the wizard variation when the component unmounts
	useEffect(() => {
		const showConfirmationPrompt = (onConfirmLeaving: () => void) =>
			Alert.alert(Strings.t_unsaved_changes_title, Strings.t_unsaved_changes_description, [
				{ text: Strings.t_stay, style: 'cancel', onPress: () => {} },
				{
					text: Strings.t_discard,
					style: 'destructive',
					onPress: () => {
						allowExit()
						resetWizardVariation()
						const parentNav: any = navigation.getParent?.()
						if (parentNav?.goBack) parentNav.goBack()
						else navigation.goBack()
						// Reset the guard after the navigation proceeds to keep future prompts working
						setTimeout(resetExit, 0)
					},
				},
			])
		const unsubscribe = navigation.addListener('beforeRemove', (e) => {
			if (allowExitRef.current) return
			if (!existingVariation) {
				// If there are no variations, allow normal navigation
				return
			}
			const leave = () => navigation.dispatch(e.data.action)

			e.preventDefault()
			showConfirmationPrompt(leave)
		})

		// Clean up the event listener
		return unsubscribe
	}, [navigation, existingVariation, resetWizardVariation])

	useEffect(() => {
		const removeNotifications = () => {
			props?.setVariantsNotification([])
		}

		return removeNotifications
	}, [])

	useEffect(() => {
		logEvent('Product Variants Wizard View', { definedVariations: chosenVariations.length })
	}, [])

	return (
		<DetailPage
			goBack={() => navigation.dispatch(StackActions.popToTop())}
			navigate={navigation.navigate}
			navigation={navigation}
			pageTitle={Strings.t_title}
			rightButtons={rightButtons}
		>
			{isCreatingSKUs && <VariantLoader />}
			<Container backgroundColor={colors.lightBg} flex={1}>
				{shouldRenderCatalogVersionWarning && <CatalogVersionWarning />}
				<ScrollView style={containerStyle}>
					<Padding all={CONTENT_SPACING}>
						<Center>
							<Image
								style={{ width: WIZARD_IMAGE_SIZE, height: WIZARD_IMAGE_SIZE }}
								source={{ uri: illustrationMap() }}
								resizeMode="contain"
							/>

							<Body18 {...generateTestID(subtitleAndDescriptioMap.testID)} weight={600}>
								{subtitleAndDescriptioMap.subtitle}
							</Body18>
							<Padding vertical={20}>
								<Body16 lineHeight={20} textAlign="center">
									{renderBoldText(subtitleAndDescriptioMap.description, {
										size: 16,
									})}
								</Body16>
							</Padding>
						</Center>
						{chosenVariations.map((variation, index) => variantContainer(renderVariations(variation), index))}
						{addButtonsArray.map((_, index) => variantContainer(renderAddVariantionButton(index), index))}
						{!isGrowOrPrime && !existingVariation && (
							<SecondVariantPayWallLabel
								onPress={() => {
									const { remoteKey } = Features.items[Features.VARIANTS_GROW_PAYWALL]
									return toggleBillingMessage(true, 'Pro', remoteKey ?? '')
								}}
							/>
						)}
					</Padding>
				</ScrollView>
				{existingVariation ? (
					<Padding left={CONTENT_SPACING} right={CONTENT_SPACING} bottom={CONTENT_SPACING}>
						<KyteBaseButton
							{...generateTestID('apply-variations')}
							onPress={submitProductSKUsGenerator}
							type={isProceedDisabled || isSubmitting ? 'tertiary' : 'primary'}
							disabledButton={isProceedDisabled || isSubmitting}
						>
							{Strings.t_generate_itens}
						</KyteBaseButton>
					</Padding>
				) : (
					<Padding left={CONTENT_SPACING} right={CONTENT_SPACING} bottom={CONTENT_SPACING}>
						<KyteBaseButton
							{...generateTestID('back-to-previous-variations')}
							onPress={navigation.goBack}
							type={'disabled'}
						>
							{Strings.t_back_button}
						</KyteBaseButton>
					</Padding>
				)}
			</Container>
			<RequiredProductFieldsModal isModalVisible={isVisible} hideModal={() => setModalVisibility(false)} />
			<KyteNotifications containerProps={{}} notifications={notifications} />
		</DetailPage>
	)
}

const VariantsCreationSetup = createVariantForm(VARIANT_CREATE_FORM_NAME, VariantsCreationSetupComponent)

const mapStateToProps = (state: any) => {
	type RootState = { variants: IVariantsState; auth: IAuthState; products: any; billing: IBilling; common: any }
	const { variants, auth, products, billing, common }: RootState = state
	const { productManaging }: { productManaging: IProductManaging } = products
	const { notifications } = variants

	return {
		productFormValues: getFormValues('ProductSave')(state),
		variants,
		auth,
		productManaging,
		notifications,
		billing,
	}
}

export default connect(mapStateToProps, {
	setWizardSelectedVariant,
	generateProductSKUs,
	getVariations,
	removeWizardVariation,
	removeWizardVariationOption,
	resetWizardVariation,
	productDetailUpdate,
	setVariantsNotification,
	setSKUsGenerationLimit,
	toggleBillingMessage,
	destroyOptionsForm: () => destroy(OPTIONS_CREATE_FORM_NAME),
})(VariantsCreationSetup as any)
