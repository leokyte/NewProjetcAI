import { KyteText } from '@kyteapp/kyte-ui-components'
import React from 'react'

/**
 * Split text with [[bold]] markers, returning a version with <strong> instead of the markers
 * @returns React.Fragment
 */
// eslint-disable-next-line import/prefer-default-export
export const renderBoldText = (text, textStyles) => {
	const splittedText = text.split('[[bold]]')
	const renderBoldWrapper = (children, id) => (
		<KyteText key={id} {...textStyles} weight={500}>
			{children}
		</KyteText>
	)

	return (
		<>
			{splittedText.map((currentText, id) => {
				const isOdd = id % 2 !== 0
				const isBold = isOdd

				return isBold ? renderBoldWrapper(currentText, id) : currentText
			})}
		</>
	)
}
