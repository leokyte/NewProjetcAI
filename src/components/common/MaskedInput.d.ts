import { ReactNode } from 'react'
import { TextInputMaskOptionProp, TextInputMaskTypeProp } from 'react-native-masked-text'

export interface MaskedInputProps {
	value?: number | string
	onChangeText: (value: string) => void
	placeholder?: string
	placeholderColor?: string
	type: TextInputMaskTypeProp
	options?: TextInputMaskOptionProp
	editable?: boolean
	secureTextEntry?: boolean
	keyboardType?: string
	maxLength?: number
	autoFocus?: boolean
	hideLabel?: boolean
	hideUnit?: boolean
	noBorder?: boolean
	noConvert?: boolean
	style?: object
	height?: number
	flex?: boolean
	error?: string
	mask?: string
	suffixUnit?: string
	returnKeyType?: string
	checkText?: (text: string) => boolean
	onFocus?: () => void
	onBlur?: () => void
	rightIcon?: ReactNode
	testProps?: object
}

declare const MaskedInput: React.ComponentType<MaskedInputProps>
export default MaskedInput
