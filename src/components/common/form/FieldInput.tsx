import React, { ComponentProps } from 'react'
import { Input } from '../Input'

type KyteButtonProps = ComponentProps<typeof Input>

const FieldInput = (field: KyteButtonProps) => {
	return (
		<Input
			{...field}
			{...field.input}
			onChangeText={field.input.onChange}
			onFocus={field.focusIn}
			onBlur={field.focusOut}
			placeholder={field.placeholder}
			keyboardType={field.kind}
			style={field.style}
			placeholderColor={field.placeholderColor}
			maxLength={field.maxLength}
			editable={field.editable}
			inputRef={field.inputRef}
			underlineColor={field.underlineColor}
			error={field.meta.touched ? field.meta.error : ''}
			substring={field.substring}
			displayIosBorder={field.displayIosBorder}
			hideLabel={field.hideLabel}
			returnKeyType="done"
			rightIcon={field.rightIcon}
			rightIconStyle={field.rightIconStyle}
			pointerEvents={field.pointerEvents}
			multiline={field.multiline}
			numberOfLines={field.numberOfLines}
			autoCorrect={field.autoCorrect}
			testProps={field.testProps}
		/>
	)
}

export default FieldInput
