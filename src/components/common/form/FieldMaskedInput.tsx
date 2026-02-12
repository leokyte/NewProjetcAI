import React, { ComponentProps } from 'react'
import { Input } from '../Input'
import MaskedInput from '../MaskedInput'

type KyteButtonProps = ComponentProps<typeof Input>

const FieldMaskedInput = (field: KyteButtonProps) => {
	return (
		<MaskedInput
			{...field.input}
			onChangeText={field.input.onChange}
			onFocus={field.focusIn}
			onBlur={field.focusOut}
			placeholder={field.placeholder}
			keyboardType={field.kind}
			style={field.style}
			placeholderColor={field.placeholderColor}
			type={field.type}
			error={field.meta.touched ? field.meta.error : ''}
			returnKeyType="done"
			maxLength={field.maxLength}
			inputRef={field.inputRef}
			testProps={field.testProps}
		/>
	)
}

export default FieldMaskedInput
