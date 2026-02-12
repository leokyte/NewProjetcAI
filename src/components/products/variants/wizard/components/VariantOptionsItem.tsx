import React from 'react'
import { Container, Row, Padding, Checkbox, IconButton, colors, KyteText } from '@kyteapp/kyte-ui-components'
import { Input } from '../../../../common'
import { IVariantOption } from '../../../../../stores/variants/variants.types'
import { generateTestID } from '../../../../../util'
import { checkOptionAlreadyExists, CONTENT_SPACING } from '../createVariantForm'
import I18n from '../../../../../i18n/i18n'

interface VariantOptionsItemProps {
	option: IVariantOption
	currentOptions: IVariantOption[]
	index: number
	editable?: boolean
	isNewOption?: boolean
	isReadOnlyOption?: boolean
	typeName: string
	onToggle: (option: IVariantOption) => void
	onRemove: (option: IVariantOption) => void
	onEditTitle: (option: IVariantOption, title: string) => void
	onFocusChange: (option: IVariantOption, isFocused: boolean) => void
	handleBlur?: () => void
}

const Strings = {
	t_option_placeholder: I18n.t('variantsWizard.optionNamePlaceholder'),
	t_validate_option_name: I18n.t('variantsWizard.optionNameRequired'),
	t_tap_to_add_label: I18n.t('variantsList.instructions'),
}

type TErrorKeys = 'emptyName' | 'duplicateName' | 'default'

const VariantOptionsItem: React.FC<VariantOptionsItemProps> = ({
	option,
	currentOptions,
	index,
	onToggle,
	onRemove,
	onEditTitle,
	onFocusChange,
	editable = true,
	isNewOption = false,
	isReadOnlyOption = false,
	handleBlur,
	typeName
}) => {
	
	const hasDuplicateName = isNewOption ? checkOptionAlreadyExists(currentOptions, option) : false
	const hasErrors = isNewOption && option?.isTouched && option?.isFocused && !option?.title
	
	const shouldShowDuplicateError = () => {
		if (!hasDuplicateName) return false
		
		const firstDuplicateIndex = currentOptions.findIndex(
			opt => opt.title?.toLowerCase()?.trim() === option.title?.toLowerCase()?.trim()
		)
		
		return index !== firstDuplicateIndex
	}
	
	const showDuplicateError = isNewOption && option?.isTouched && !option?.isFocused && shouldShowDuplicateError()
	const errorkeys: TErrorKeys = !option?.title ? 'emptyName' : hasDuplicateName ? 'duplicateName' : 'default'

	const errorsMap: { [key in TErrorKeys]: string } = {
		emptyName: Strings.t_validate_option_name,
		duplicateName: I18n.t('variantsWizard.optionAlreadyExist', {
			optionName: option?.title,
		}),
		default: Strings.t_validate_option_name,
	}

	const renderClearFieldIcon = (option: IVariantOption) => (
		<Container position="relative" right={-5}>
			<IconButton
				onPress={() => onEditTitle(option, '')}
				size={10}
				testID="clear_input_name_option"
				name="close-navigation"
			/>
		</Container>
	)

	const errorMessage = errorsMap[errorkeys]

	const canToggle = !isReadOnlyOption
	const canEdit = isNewOption && editable
	const canDelete = isNewOption && editable
	
	const handleToggle = () => {
		if (!canToggle) {
			return
		}
		
		onToggle(option)
	}

	const shouldShowInformativeLabel = !option?.active && !option?.isFocused && isNewOption && option?.title?.trim()

	return (
		<Padding vertical={showDuplicateError || hasErrors ? 8 : 2.5}>
			<Row alignItems="center">
				<Checkbox
					active={option?.active}
					onPress={handleToggle}
					{...generateTestID(`checkbox-option-vt-${index}`)}
				/>
				<Container flex={1} position="relative" paddingHorizontal={CONTENT_SPACING}>
					<Input
						style={{
							fontFamily: !option?.isFocused && option?.title ? 'Graphik-Medium' : 'Graphik-Regular',
							fontSize: 14,
							opacity: isReadOnlyOption ? 0.7 : 1, 
						}}
						hideLabel
						autoFocus={option?.isFocused && canEdit}
						noBorder={(!option?.isFocused && !hasErrors) || false}
						value={option?.title}
						placeholderColor={colors.gray02Kyte}
						placeholder={canEdit ? `${Strings.t_option_placeholder} ${typeName}` : option?.title}
						autoCorrect
						maxLength={25}
						editable={canEdit}
						testProps={generateTestID('input-option-vt')}
						onChangeText={(value: string) => canEdit ? onEditTitle(option, value) : undefined}
						onFocus={() => canEdit ? onFocusChange(option, true) : undefined}
						onBlur={() => {
							if (canEdit) {
								onFocusChange(option, false)
								handleBlur?.()
							}
						}}
						error={hasErrors || showDuplicateError ? errorMessage : null}
						rightIcon={option?.isFocused && option?.title && canEdit ? renderClearFieldIcon(option) : null}
						returnKeyType="done"
					/>
					{shouldShowInformativeLabel && !showDuplicateError && (
						<Container position="absolute" bottom={0} left={6} right={0}>
							<KyteText
								size={11}
								color={colors.red}
								lineHeight={14}
								allowFontScaling={false}
							>
								{Strings.t_tap_to_add_label}
							</KyteText>
						</Container>
					)}
				</Container>
				{!option?.isFocused && canDelete ? (
					<IconButton {...generateTestID(`remove-option-vt-${index}`)} name="trash" onPress={() => onRemove(option)} />
				) : null}
			</Row>
		</Padding>
	)
}

export default VariantOptionsItem
