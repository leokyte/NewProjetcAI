import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react'
import { Keyboard, ScrollView, TouchableWithoutFeedback } from 'react-native'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import KyteButton from '@kyteapp/kyte-ui-components/src/packages/buttons/kyte-button/KyteButton'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import { colors } from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { Padding } from '@kyteapp/kyte-ui-components'
import { IVariation } from '@kyteapp/kyte-utils'
import { connect } from 'react-redux'

import { IVariant, IVariantOption } from '../../../stores/variants/variants.types'
import { IAuthState } from '../../../types/state/auth'
import { RootState } from '../../../types/state/RootState'

import BottomModal from '../../common/modals/BottomModal'
import I18n from '../../../i18n/i18n'
import VariantOptionsItem from './wizard/components/VariantOptionsItem'

const MemoizedVariantOptionsItem = memo(VariantOptionsItem, (prevProps, nextProps) => {
	const optionChanged = prevProps.option?.title !== nextProps.option?.title 
		|| prevProps.option?.isFocused !== nextProps.option?.isFocused 
		|| prevProps.option?.active !== nextProps.option?.active 
		|| prevProps.option?.isTouched !== nextProps.option?.isTouched

	const metadataChanged = prevProps.isNewOption !== nextProps.isNewOption 
		|| prevProps.isReadOnlyOption !== nextProps.isReadOnlyOption 
		|| prevProps.editable !== nextProps.editable

	const indexChanged = prevProps.index !== nextProps.index

	return !(optionChanged || metadataChanged || indexChanged)
})
import AddEntryButton from '../../common/buttons/AddEntryButton'
import {
	checkOptionsWithoutTitle,
	checkOptionsWithSameName,
	checkOptionsActive,
	CONTENT_SPACING,
} from './wizard/createVariantForm'
import { generateTestID } from '../../../util'
import useKeyboardStatus from '../../../hooks/useKeyboardStatus'

export interface AddNewVariationOptionModalProps {
	isVisible: boolean
	onClose: () => void
	variation: IVariation
	originalVariation?: IVariation
	selectedVariation: IVariant
	onSave?: (variant: IVariant) => void
}

interface ConnectedProps extends AddNewVariationOptionModalProps {
	auth: IAuthState
}

const Strings = {
	t_title: I18n.t('variantsList.addOption'),
	t_disclaimer: I18n.t('addVariationOptionsModal.disclaimer'),
	t_instructions: I18n.t('addVariationOptionsModal.instructions'),
	t_save: I18n.t('SocialmediaIntegration.moreInfo.button.save'),
	t_create_new: I18n.t('variantsList.createNew'),
}

const AddNewVariationOptionModalComponent: React.FC<ConnectedProps> = ({
	isVisible,
	onClose,
	variation,
	originalVariation,
	selectedVariation,
	onSave,
	auth,
}) => {
	const isKeyboardOpen = useKeyboardStatus()
	const scrollRef = useRef<ScrollView>(null)

	const [currentOptions, setCurrentOptions] = useState<IVariantOption[]>([])

	useEffect(() => {
		if (!isVisible || currentOptions.length > 0) return

		const isValidOption = (option: IVariantOption) => {
			return option && option?.title && option.title.trim() !== ''
		}

		const allGlobalOptions = selectedVariation?.options?.filter(isValidOption) || []
		const currentProductOptions = variation?.options?.filter(isValidOption) || []

		const allAvailableOptions: IVariantOption[] = []

		allGlobalOptions?.forEach((globalOption) => {
			const isInTemporarySelection = currentProductOptions?.some(
				(productOption) => productOption?.title?.toLowerCase()?.trim() === globalOption?.title?.toLowerCase()?.trim()
			)

			allAvailableOptions.push({
				...globalOption,
				id: globalOption.id || Math.floor(Math.random() * 90000) + 10000,
				active: isInTemporarySelection,
				isFocused: false,
				isTouched: false,
			})
		})

		currentProductOptions?.forEach((tempOption) => {
			const existsInGlobal = allGlobalOptions?.some(
				(globalOption) => globalOption?.title?.toLowerCase()?.trim() === tempOption?.title?.toLowerCase()?.trim()
			)

			if (!existsInGlobal && tempOption?.title?.trim()) {
				allAvailableOptions.push({
					...(tempOption as any),
					id: (tempOption as any)?.id || Math.floor(Math.random() * 90000) + 10000,
					active: true,
					isFocused: false,
					isTouched: false,
				})
			}
		})

		setCurrentOptions(allAvailableOptions)
	}, [isVisible, selectedVariation?.options, variation?.options])

	useEffect(() => {
		if (!isVisible) {
			setCurrentOptions([])
		}
	}, [isVisible])

	const isValidOption = (option: IVariantOption) => {
		return option && option?.title && option.title.trim() !== ''
	}

	const allGlobalOptions = selectedVariation?.options?.filter(isValidOption) || []
	const currentProductOptions = variation?.options?.filter(isValidOption) || []
	const originalProductOptions = (originalVariation?.options || variation?.options || []).filter(isValidOption)

	const optionsWithoutTitle = checkOptionsWithoutTitle(currentOptions)
	const hasSameNameOptions = checkOptionsWithSameName(currentOptions)
	const isAddDisabled = optionsWithoutTitle || hasSameNameOptions
	const activeOptions = checkOptionsActive(currentOptions)

	const currentTempTitles = new Set(currentProductOptions.map((opt) => opt?.title?.toLowerCase()?.trim()))
	const modalActiveTitles = new Set(activeOptions.map((opt) => opt?.title?.toLowerCase()?.trim()))

	const hasDiff =
		currentTempTitles.size !== modalActiveTitles.size ||
		Array.from(modalActiveTitles).some((title) => !currentTempTitles.has(title)) ||
		Array.from(currentTempTitles).some((title) => !modalActiveTitles.has(title))

	const toggleVariantOption = useCallback((option: IVariantOption) => {
		setCurrentOptions((prevOptions) => {
			return prevOptions.map((opt) => {
				if (opt?.id === option?.id) {
					return { ...opt, active: !opt.active }
				}
				return opt
			})
		})
	}, [])

	const removeVariantOption = useCallback((option: IVariantOption) => {
		setCurrentOptions((prevOptions) => {
			return prevOptions.filter((currentOption) => currentOption?.id !== option.id)
		})
	}, [])

	const editOptionTitle = useCallback((option: IVariantOption, title: string) => {
		if (option.title === title) return

		setCurrentOptions((prevOptions) => {
			return prevOptions.map((opt) => (opt.id === option.id ? { ...opt, title, isTouched: true } : opt))
		})
	}, [])

	const setOptionFocus = useCallback((option: IVariantOption, isFocused: boolean) => {
		if (option.isFocused === isFocused) return

		setCurrentOptions((prevOptions) => {
			return prevOptions.map((opt) => (opt?.id === option?.id ? { ...opt, isFocused } : opt))
		})
	}, [])

	const addNewOption = () => {
		if (isAddDisabled) {
			return
		}

		const randomId = Math.floor(Math.random() * 90000) + 10000
		const newOption = { title: '', id: randomId, active: true, isFocused: true }
		const updatedOptions = [...currentOptions, newOption]

		setCurrentOptions(updatedOptions)
		scrollRef.current?.scrollToEnd({ animated: true })
	}

	const handleSave = () => {
		if (!hasDiff) return

		const validActiveOptions = activeOptions.filter((option) => {
			return option && option?.title && option.title.trim() !== '' && option.active
		})

		const cleanOptions = validActiveOptions.map((option) => ({
			title: option.title,
			id: option.id,
			photos: option.photos,
		}))

		const updatedVariant: IVariant = {
			...selectedVariation,
			aid: auth?.aid,
			uid: auth?.user?.uid,
			options: cleanOptions,
		}

		onSave?.(updatedVariant)
		onClose()
	}

	const clearBlankOptionMemoized = useCallback((optionIndex: number) => {
		setCurrentOptions((prevOptions) => {
			if (prevOptions?.length - 1 === optionIndex) {
				const lastOption = prevOptions[prevOptions.length - 1]
				const shouldClear = !lastOption?.title && !lastOption?.isFocused

				if (shouldClear) {
					return prevOptions.filter((_, index) => index !== prevOptions.length - 1)
				}
			}
			return prevOptions
		})
	}, [])

	const handleBlurByIndex = useMemo(() => {
		const handlers: { [key: number]: () => void } = {}
		currentOptions.forEach((_, index) => {
			handlers[index] = () => clearBlankOptionMemoized(index)
		})
		return handlers
	}, [currentOptions.length, clearBlankOptionMemoized])

	const optionsMetadata = useMemo(() => {
		return (
			currentOptions?.map((option) => {
				const wasOriginallyLinkedToProduct = originalProductOptions?.some(
					(productOption) => productOption?.title?.toLowerCase()?.trim() === option?.title?.toLowerCase()?.trim()
				)

				const isCurrentlySelectedInTemp = currentProductOptions?.some(
					(productOption) => productOption?.title?.toLowerCase()?.trim() === option?.title?.toLowerCase()?.trim()
				)

				const existsInGlobalVariant = allGlobalOptions?.some(
					(globalOption) => globalOption?.title?.toLowerCase()?.trim() === option?.title?.toLowerCase()?.trim()
				)

				const isReadOnlyOption = wasOriginallyLinkedToProduct && isCurrentlySelectedInTemp
				const isNewOption = !existsInGlobalVariant

				return {
					optionId: option?.id,
					isReadOnlyOption,
					isNewOption,
				}
			}) || []
		)
	}, [currentOptions.length, allGlobalOptions?.length, originalProductOptions?.length, currentProductOptions?.length])

	const renderOptionsMap = () => {
		return currentOptions?.map((option, index) => {
			const metadata = optionsMetadata[index] || { isReadOnlyOption: false, isNewOption: false }

			return (
				<MemoizedVariantOptionsItem
					typeName={variation.name}
					key={option?.id || `option-${index}`}
					option={option}
					currentOptions={currentOptions}
					index={index}
					isNewOption={metadata.isNewOption}
					isReadOnlyOption={metadata.isReadOnlyOption}
					onToggle={toggleVariantOption}
					onRemove={removeVariantOption}
					onEditTitle={editOptionTitle}
					onFocusChange={setOptionFocus}
					handleBlur={handleBlurByIndex[index]}
					editable={!metadata.isReadOnlyOption}
				/>
			)
		})
	}

	if (!isVisible) return null

	return (
		<BottomModal enableDefaultPadding={false} isVisible={isVisible} onClose={onClose} title={Strings.t_title}>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Container justifyContent="space-between">
					<Container>
						<ScrollView
							ref={scrollRef}
							keyboardShouldPersistTaps="always"
							keyboardDismissMode="none"
							style={{ maxHeight: 400 }}
						>
							<Container borderTopWidth={1} borderColor={colors.gray07} padding={CONTENT_SPACING}>
								<KyteText
									allowFontScaling={false}
									color={colors.gray02Kyte}
									lineHeight={24}
									style={{ fontSize: 13, fontWeight: '500' }}
								>
									{Strings.t_disclaimer} "{variation.name}"
								</KyteText>
								<KyteText allowFontScaling={false} color={colors.gray02Kyte} lineHeight={24} style={{ fontSize: 13 }}>
									{Strings.t_instructions}
								</KyteText>
							</Container>

							<Padding top={10} horizontal={CONTENT_SPACING} bottom={CONTENT_SPACING}>
								{renderOptionsMap()}

								<Padding top={10} />
								<AddEntryButton
									onPress={addNewOption}
									title={Strings.t_create_new}
									isDisabled={isAddDisabled}
									testID={generateTestID('add-new-option-btn')}
								/>
							</Padding>
						</ScrollView>
					</Container>

					{!isKeyboardOpen && (
						<Container borderTopWidth={1} borderColor={colors.gray07} padding={CONTENT_SPACING}>
							<KyteButton activeOpacity={!hasDiff ? 0.5 : 1} disabledButton={!hasDiff} type={hasDiff ? 'primary' : 'tertiary'} onPress={handleSave}>
								{Strings.t_save}
							</KyteButton>
						</Container>
					)}
				</Container>
			</TouchableWithoutFeedback>
		</BottomModal>
	)
}

const mapStateToProps = (state: RootState, ownProps: AddNewVariationOptionModalProps) => {
	const { auth }: { auth: IAuthState } = state

	return {
		auth: auth,
	}
}

interface ConnectedProps extends AddNewVariationOptionModalProps {
	auth: IAuthState
}

const ConnectedAddNewVariationOptionModal = connect(mapStateToProps)((props: ConnectedProps) => {
	return <AddNewVariationOptionModalComponent {...props} />
})

export const AddNewVariationOptionModal = ConnectedAddNewVariationOptionModal
