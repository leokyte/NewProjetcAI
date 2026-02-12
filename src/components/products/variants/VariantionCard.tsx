import { Row } from '@kyteapp/kyte-ui-components'
import FormGroup from '@kyteapp/kyte-ui-components/src/packages/form/form-group/FormGroup'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import { IVariation } from '@kyteapp/kyte-utils'
import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import LabelButton from '../../common/buttons/LabelButton'
import I18n from '../../../i18n/i18n'
import { AddNewVariationOptionModal } from './AddNewVariationOptionModal'
import { IVariant, IVariantOption, IVariantsState } from '../../../stores/variants/variants.types'
import { setVariantsNotification } from '../../../stores/variants/actions/wizard-variation.actions'
import { KyteNotificationProps } from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import { toasTimer } from '../../common/KyteNotifications'
import { RootState } from '../../../types/state/RootState'

interface IVariantList {
	list: IVariant[]
}

interface VariationCardOwnProps {
	variation: IVariation
	originalVariation?: IVariation
	variants: IVariantList
	onVariationChange?: (variationId: string, changes: any) => void
}

interface VariationCardStateProps {
	notifications: IVariantsState['notifications']
}

interface VariationCardDispatchProps {
	setVariantsNotification: typeof setVariantsNotification
}

type VariationCardProps = VariationCardOwnProps & VariationCardStateProps & VariationCardDispatchProps

const Strings = {
	t_add_option: I18n.t('variantsList.addOption'),
}

const styles = StyleSheet.create({
	row: {
		flexWrap: 'wrap',
	},
})

const VariationCard: React.FC<VariationCardProps> = ({ variation, originalVariation, variants, onVariationChange, notifications, setVariantsNotification }) => {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		setVariantsNotification([])
		
		return () => {
			setVariantsNotification([])
		}
	}, [])

	const showRemovalNotification = useCallback((optionName: string) => {
		const notification: KyteNotificationProps = {
			title: I18n.t('variants.optionRemoved', { optionName }),
			type: NotificationType.NEUTRAL,
			timer: toasTimer,
			handleClose: () => {
				setVariantsNotification([])
			},
		}
		const updatedNotifications = [...notifications, notification]
		setVariantsNotification(updatedNotifications)
		
		setTimeout(() => {
			setVariantsNotification([])
		}, toasTimer + 500)
	}, [notifications, setVariantsNotification])

	const handleOpenAddNewVariationOptionModal = useCallback((value: boolean) => {
		setIsVisible(value)
	}, [])

	const handleSaveVariant = useCallback(
		(updatedVariant: IVariant) => {
			const validUpdatedOptions = updatedVariant.options || []

			setTemporarySelectedOptions(validUpdatedOptions)

			if (onVariationChange && variation._id) {
				onVariationChange(String(variation._id), {
					hasChanges: true,
					temporaryOptions: validUpdatedOptions,
				})
			}

			setIsVisible(false)
		},
		[onVariationChange, variation._id]
	)

	const selectedVariation = useMemo(
		() =>
			variants.list.find((v) => v._id === variation._id) ||
			({
				options: [],
				aid: '',
				uid: '',
				name: variation.name || '',
			} as IVariant),
		[variants.list, variation._id]
	)


	const [temporarySelectedOptions, setTemporarySelectedOptions] = useState<IVariantOption[]>(variation.options || [])

	useEffect(() => {
		setTemporarySelectedOptions(variation.options || [])
	}, [variation._id, JSON.stringify(variation.options)])

	const displayOptions = useMemo(() => {
		const filterValidOptions = (options: IVariantOption[]) => {
			return options.filter((option) => {
				return option && option?.title && option.title.trim() !== ''
			})
		}

		const optionsToUse = temporarySelectedOptions && temporarySelectedOptions.length >= 0 
			? temporarySelectedOptions 
			: (variation.options || [])
		
		return filterValidOptions(optionsToUse)
	}, [variation.options, temporarySelectedOptions])

	const handleRemoveOption = (optionTitle: string) => {
		if (displayOptions.length <= 1) {
			return
		}

		const updatedTemporaryOptions = temporarySelectedOptions.filter(
			(option) => option?.title?.toLowerCase()?.trim() !== optionTitle?.toLowerCase()?.trim()
		)

		setTemporarySelectedOptions(updatedTemporaryOptions)

		if (onVariationChange && variation._id) {
			onVariationChange(String(variation._id), {
				hasChanges: true,
				temporaryOptions: updatedTemporaryOptions,
			})
		}

		showRemovalNotification(optionTitle)
	}

	return (
		<>
			<FormGroup title={variation.name}>
				<Row style={styles.row}>
						{displayOptions?.map((option, index) => {
							const isLastOption = displayOptions.length === 1
							const baseVariation = originalVariation || variation
							const isNewUnsavedOption = !baseVariation.options?.some(
								(originalOption) => originalOption?.title?.toLowerCase()?.trim() === option?.title?.toLowerCase()?.trim()
							)
							return (
								<Margin key={`${index + 1}-${option?.title}`} top={10} right={12}>
									<LabelButton
										onPress={() => handleRemoveOption(option?.title)}
										label={option?.title}
										showCloseIcon={!isLastOption}
										labelState={isNewUnsavedOption ? "new" : "filled"}
									/>
								</Margin>
							)
						})}
						<Margin key={'new-item'} top={10} right={12}>
							<LabelButton
								labelState="empty"
								onPress={() => handleOpenAddNewVariationOptionModal(true)}
								label={Strings.t_add_option}
							/>
						</Margin>
					</Row>
			</FormGroup>
			<AddNewVariationOptionModal
				isVisible={isVisible}
				onClose={() => handleOpenAddNewVariationOptionModal(false)}
				variation={{
					...variation,
					name: variation.name || (originalVariation?.name || ''), 
					options: temporarySelectedOptions || variation.options || [],
				}}
				originalVariation={originalVariation || variation} 
				selectedVariation={selectedVariation}
				onSave={handleSaveVariant}
			/>
		</>
	)
}

const mapStateToProps = (state: RootState): VariationCardStateProps => ({
	notifications: state.variants.notifications || [],
})

const mapDispatchToProps: VariationCardDispatchProps = {
	setVariantsNotification,
}

export default connect(mapStateToProps, mapDispatchToProps)(VariationCard)
