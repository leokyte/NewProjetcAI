import React from "react"
import { ViewStyle } from "react-native"
import { WrappedFieldProps } from "redux-form"
import { InputTextArea } from "../InputTextArea"

export interface TextareaFieldProps extends WrappedFieldProps {
  style?: ViewStyle;
  placeholder?: string;
  placeholderColor?: string;
  autoFocus?: boolean;
  multiline?: boolean;
  textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
  noBorder?: boolean;
  hideLabel?: boolean;
  shrinkSection?: boolean;
  flex?: boolean;
  autoCorrect?: boolean;
}

const TextAreaField = (field: TextareaFieldProps) => (
  <InputTextArea
    {...field.input}
    style={field.style}
    onChangeText={field.input.onChange}
    value={field.input.value}
    placeholder={field.placeholder}
    placeholderColor={field.placeholderColor}
    autoFocus={field.autoFocus}
    multiline={field.multiline}
    textAlignVertical={field.textAlignVertical}
    noBorder={field.noBorder}
    hideLabel={field.hideLabel}
    shrinkSection={field.shrinkSection}
    flex={field.flex}
    autoCorrect={field.autoCorrect}
  />
)

export default TextAreaField