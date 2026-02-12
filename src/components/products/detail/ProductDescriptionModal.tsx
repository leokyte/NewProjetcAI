import React, { useState, useEffect } from 'react'
import { View, ScrollView, ViewStyle, Platform, Keyboard } from 'react-native'
import { Field, getFormValues } from 'redux-form'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import {
	KyteModal,
	ActionButton,
	CustomKeyboardAvoidingView,
	KyteIcon,
	KyteButton,
	LoadingCleanScreen,
	TextButton,
} from '../../common'
import {
	Body14,
	Body13,
	Body12,
	Container,
	Row,
	Padding,
	Margin,
	Label,
	isFree,
	isPro,
} from '@kyteapp/kyte-ui-components'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
	startLoading,
	stopLoading,
	AISuggestProductDescription,
	clearAISuggestProductDescription,
	checkFeatureIsAllowed,
	toggleBillingMessage,
} from '../../../stores/actions'
import TextAreaField from '../../common/inputs/TextAreaField'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import KyteNotifications from '../../common/KyteNotifications'
import { ProductNameModal } from './ProductNameModal'
import AiDescriptionTipModal from './AiDescriptionTipModal'
import DiscardAiDescriptionModal from './DiscardAiDescriptionModal'
import { DetailOrigin, Features } from '../../../enums'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import { logEvent } from '../../../integrations'

const Strings = {
	UNSPIRED: I18n.t('outOfInspiration'),
	AI_HELP: I18n.t('aiHelp'),
	EDIT_OR_NEW: I18n.t('editOrAskSuggestions'),
	SUGGEST_DESCRIPTION: I18n.t('suggestDescription'),
	ENHANCE_DESCRIPTION: I18n.t('enhanceDescription'),
	DISCARD: I18n.t('words.s.discard'),
	USE_DESCRIPTION: I18n.t('useDescription'),
	SAVE: I18n.t('productSaveButton'),
	LOADING: I18n.t('generatingDescription'),
	SAVING_DESCRIPTION_ERROR: I18n.t('savingDescriptionError'),
	DESCARTED_SUGGESTION: I18n.t('suggestionDiscarded'),
	AI_SUGGESTED_DESCRIPTION: I18n.t('aiSuggestedDescription'),
	DESCRIPTION: I18n.t('productDescriptionLabel'),
	SUGGESTED_DESCRIPTION: I18n.t('suggestedDescription'),
	AI_TIP_TITLE: I18n.t('aiTip.title'),
	AI_TIP_DESCRIPTION: I18n.t('aiTip.description'),
	AI_HELP_BUTTON: I18n.t('aiTip.button'),
}

interface AIDescriptionPayload {
	aid: string
	product: {
		name: string
		description?: string
		category?: string
	}
	store: {
		name?: string
		description?: string
	}
	language: string
}

interface AIDescriptionPayload {
	aid: string
	product: {
		name: string
		description?: string
		category?: string
	}
	store: {
		name?: string
		description?: string
	}
	language: string
	tag: 'app' | 'web'
}
interface ProductDescriptionModalProps {
	isVisible: boolean
	formValues: {
		name: string
		description: string
		category?: {
			name: string
		}
	}
	shrinkSection?: boolean
	loader: boolean
	store: {
		name?: string
		description?: string
		infoExtra?: string
	}
	aiDescription: string
	aid: string
	billing: any
	origin: number
	onClose: () => void
	onSave: () => void
	onCleanField: () => void
	AISuggestProductDescription: (
		params: AIDescriptionPayload,
		callback: (value: string) => void
	) => (dispatch: any) => Promise<void>
	clearAISuggestProductDescription: () => void
	onChangeDescription: (description: string) => void
	onChangeName: (name: string) => void
	checkFeatureIsAllowed: (key: string, callback: () => void, remoteKey: string, isGrowFeature: boolean) => boolean
	toggleBillingMessage: (visibility: boolean, message: string, remoteKey: string) => void
}

interface ToastProps {
	title: string
	type: NotificationType
	handleClose: () => void
}

const OutlineButton = ({
	title,
	onPress,
	hasIcon = true,
	label,
}: {
	title: string
	onPress: () => void
	hasIcon?: boolean
	label?: string
}) => (
	<KyteButton
		onPress={onPress}
		style={{ paddingHorizontal: 12 }}
		height={48}
		borderWidth={1.5}
		borderColor={colors.primaryDarker}
	>
		<Container>
			<Row justifyContent="center" alignItems="center" flex={1}>
				{hasIcon && <KyteIcon name="ai" size={18} />}
				<KyteText marginLeft={5} marginRight={6} weight={500} size={14}>
					{title}
				</KyteText>

				{label && (
					<Label backgroundColor={colors.primaryDarker} textProps={{ size: 9 }}>
						{label}
					</Label>
				)}
			</Row>
		</Container>
	</KyteButton>
)

const ProductDescriptionModal: React.FC<ProductDescriptionModalProps> = ({
	isVisible,
	formValues,
	loader,
	store,
	aiDescription,
	aid,
	billing,
	origin,
	onClose,
	onSave,
	onCleanField,
	AISuggestProductDescription,
	clearAISuggestProductDescription,
	onChangeDescription,
	onChangeName,
	checkFeatureIsAllowed,
	toggleBillingMessage,
}) => {
	const [isProductNameModalVisible, setIsProductNameModalVisible] = useState(false)
	const [isAiDescriptionTipModalVisible, setIsAiDescriptionTipModalVisible] = useState(false)
	const [isDiscardAiDescriptionModalVisible, setIsDiscardAiDescriptionModalVisible] = useState(false)
	const [initialDescription] = useState(formValues.description)
	const [toast, setToast] = useState<ToastProps | null>(null)
	const [isKeyboardVisible, setKeyboardVisible] = useState(false)
	const buttonContainer: ViewStyle = {
		height: 70,
		paddingVertical: 12,
		borderTopWidth: 1,
		borderColor: colors.disabledIcon,
	}
	const isIos = Platform.OS === 'ios'
	const isBasicPlan =
		isFree({ status: billing.status, plan: billing.plan }) || isPro({ status: billing.status, plan: billing.plan })
	const rightButtons = [
		{
			title: I18n.t('words.s.clear'),
			onPress: () => {
				onCleanField()
				clearAISuggestProductDescription()
			},
		},
	]
	const eventProps = {
		has_previous_content: !!initialDescription,
		has_category: !!formValues.category,
		has_store_info: !!store?.infoExtra,
	}

	const generateDescription = () => {
		const payload: AIDescriptionPayload = {
			aid,
			product: {
				name: formValues.name,
				description: formValues.description,
				category: formValues.category?.name,
			},
			store: {
				name: store.name,
				description: store.description,
			},
			language: I18n.t('locale'),
			tag: 'app'
		}

		AISuggestProductDescription(payload, (description) => {
			if (description) {
				logEvent('Product AI Description Request', {
					...eventProps,
				})
				onChangeDescription(description)
				onChangeName(formValues.name)
			} else {
				const errorToast = {
					handleClose: () => setToast(null),
					title: Strings.SAVING_DESCRIPTION_ERROR,
					type: NotificationType.ERROR,
				}
				setToast(errorToast)
			}
		})
	}

	const handleGenerateDescription = () => {
		const canGenerateDescription = !!formValues.name

		if (canGenerateDescription) {
			generateDescription()
			return
		}
		setIsProductNameModalVisible(true)
	}

	const handleDiscardDescription = () => {
		const successToast = {
			timer: 3000,
			handleClose: () => setToast(null),
			title: Strings.DESCARTED_SUGGESTION,
			type: NotificationType.NEUTRAL,
		}

		logEvent('Product AI Description Reject', {
			...eventProps,
			is_edited: origin !== DetailOrigin.CREATE,
		})
		setToast(successToast)
		clearAISuggestProductDescription()
		onChangeDescription(initialDescription)
	}

	const handleAIGenerationAllowed = () => {
		const { key, remoteKey } = Features.items[Features.AI_PRODUCT_DESCRIPTION]

		if (isBasicPlan) {
			if (isIos) onClose()
			return toggleBillingMessage(true, 'Pro', remoteKey ?? '')
		}
		checkFeatureIsAllowed(key, handleGenerateDescription, remoteKey ?? '', true)
	}

	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
			setKeyboardVisible(true)
		})
		const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
			setKeyboardVisible(false)
		})

		return () => {
			keyboardDidHideListener.remove()
			keyboardDidShowListener.remove()
		}
	}, [])

	return (
		<KyteModal
			height="100%"
			fullPage
			fullPageTitle={aiDescription ? Strings.AI_SUGGESTED_DESCRIPTION : Strings.DESCRIPTION}
			headerTitleStyle={{ fontSize: 16 }}
			fullPageTitleIcon="back-navigation"
			hideFullPage={() => {
				onClose()
				clearAISuggestProductDescription()
				if (!initialDescription) {
					onCleanField()
				} else {
					onChangeDescription(initialDescription)
				}
			}}
			isModalVisible={isVisible}
			rightButtons={formValues.description ? rightButtons : []}
		>
			{loader && <LoadingCleanScreen text={Strings.LOADING} />}
			<CustomKeyboardAvoidingView style={{ flex: 1 }}>
				<Container flex={1} backgroundColor={colors.lightBg} paddingLeft={16} paddingRight={16}>
					<ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
						<Margin bottom={16}>
							<Field
								style={{ paddingTop: 16, paddingLeft: 5 }}
								name="description"
								component={TextAreaField}
								autoFocus={!isIos}
								multiline
								textAlignVertical="top"
								flex
								autoCorrect
								placeholder={aiDescription ? Strings.SUGGESTED_DESCRIPTION : Strings.DESCRIPTION}
								noBorder={!!aiDescription}
								shrinkSection={0}
							/>
						</Margin>

						{aiDescription && (
							<Container backgroundColor={colors.green08} padding={16} borderRadius={8}>
								<Row alignItems="center">
									<KyteIcon name="ai" size={24} color={colors.green01} />

									<Container flex={1} marginLeft={13}>
										<Body13 weight={500} style={{ flex: 1 }}>
											{Strings.AI_TIP_TITLE}
										</Body13>

										<Body12 marginTop={4} marginBottom={4} lineHeight={17}>
											{Strings.AI_TIP_DESCRIPTION}
										</Body12>

										<TextButton
											alignItems="center"
											testProps={{ style: { padding: 8 } }}
											noPadding
											onPress={() => {
												setIsAiDescriptionTipModalVisible(true)
												logEvent('Product AI Description Tips View', {
													has_previous_content: !!initialDescription,
												})
											}}
										>
											<KyteIcon name="nav-arrow-right" size={12} />
											<Padding horizontal={2} />
											<Body13 weight={500}>{Strings.AI_HELP_BUTTON}</Body13>
										</TextButton>
									</Container>
								</Row>
							</Container>
						)}
					</ScrollView>

					{!aiDescription && (
						<Padding vertical={16}>
							<Row alignItems="center" justifyContent="flex-end">
								<Container alignItems="flex-end" marginRight={16}>
									<Body12 lineHeight={18}>{Strings.UNSPIRED}</Body12>
									<Body12 lineHeight={18}>{Strings.AI_HELP}</Body12>
								</Container>

								<OutlineButton
									title={formValues.description ? Strings.ENHANCE_DESCRIPTION : Strings.SUGGEST_DESCRIPTION}
									onPress={handleAIGenerationAllowed}
									label={isBasicPlan ? 'GROW' : undefined}
								/>
							</Row>
						</Padding>
					)}
				</Container>

				<View style={buttonContainer}>
					{aiDescription ? (
						<Padding horizontal={16}>
							<Row alignItems="center">
								<Container flex={0.35} marginRight={10}>
									<OutlineButton
										title={Strings.DISCARD}
										onPress={() => setIsDiscardAiDescriptionModalVisible(true)}
										hasIcon={false}
									/>
								</Container>

								<Container flex={0.65}>
									<KyteButton
										onPress={() => {
											onSave()
											logEvent('Product AI Description Accept', {
												...eventProps,
												is_edited: origin !== DetailOrigin.CREATE,
											})
										}}
										style={{ paddingHorizontal: 12 }}
										height={48}
										background={colors.actionColor}
									>
										<KyteText marginLeft={5} color={colors.white} weight={500} size={15}>
											{Strings.USE_DESCRIPTION}
										</KyteText>
									</KyteButton>
								</Container>
							</Row>
						</Padding>
					) : (
						<ActionButton onPress={onSave} full>
							{Strings.SAVE}
						</ActionButton>
					)}
				</View>
				{isProductNameModalVisible && (
					<ProductNameModal
						isVisible={isProductNameModalVisible}
						nameValue={formValues.name}
						hasCategory={!!formValues.category}
						hasPreviousDescription={!!initialDescription}
						hasStoreInfo={!!store?.infoExtra}
						isKeyboardVisible={isKeyboardVisible}
						onClose={() => {
							setIsProductNameModalVisible(false)
							onChangeName('')
						}}
						onSubmit={generateDescription}
					/>
				)}

				{isAiDescriptionTipModalVisible && (
					<AiDescriptionTipModal
						isVisible={isAiDescriptionTipModalVisible}
						onClose={() => setIsAiDescriptionTipModalVisible(false)}
					/>
				)}

				{isDiscardAiDescriptionModalVisible && (
					<DiscardAiDescriptionModal
						isVisible={isDiscardAiDescriptionModalVisible}
						onClose={() => setIsDiscardAiDescriptionModalVisible(false)}
						onDiscard={handleDiscardDescription}
					/>
				)}
				{Boolean(toast) && <KyteNotifications containerProps={{}} notifications={[toast]} />}
			</CustomKeyboardAvoidingView>
		</KyteModal>
	)
}

const mapStateToProps = (state: any) => ({
	formValues: getFormValues('ProductSave')(state),
	loader: state.common.loader.visible,
	aid: state.auth.aid,
	store: state.auth.store,
	aiDescription: state.products.aiDescription,
	billing: state.billing,
	origin: state.products.detailOrigin,
})

const mapDispatchToProps = (dispatch: any) => ({
	dispatch,
	...bindActionCreators(
		{
			AISuggestProductDescription,
			clearAISuggestProductDescription,
			startLoading,
			stopLoading,
			checkFeatureIsAllowed,
			toggleBillingMessage,
		},
		dispatch
	),
})

export default connect(mapStateToProps, mapDispatchToProps)(ProductDescriptionModal as any)
