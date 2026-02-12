import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { colors } from '../../styles'

interface WizardProgressBarProps {
	currentStep: number
	totalSteps: number
}

const styles = {
	content: {
		flexDirection: 'row',
		backgroundColor: colors.actionLight,
	} as StyleProp<ViewStyle>,
	progressBar: (flex: number) =>
		({
			flex,
			backgroundColor: colors.actionColor,
			height: 4,
		} as StyleProp<ViewStyle>),
}

/**
 * Renders a progress bar for a wizard component. Remember to use the same number of total steps in the same Wizard
 *
 * @param {number} currentStep - The current step of the wizard.
 * @param {number} totalSteps - The total number of steps in the wizard.
 * @returns {JSX.Element} - The rendered progress bar.
 */

const WizardProgressBar: React.FC<WizardProgressBarProps> = ({ currentStep, totalSteps }) => {
	const { content, progressBar } = styles
	const flex = currentStep <= totalSteps ? currentStep / totalSteps : 1

	return (
		<View style={content}>
			<View style={progressBar(flex)} />
		</View>
	)
}

export { WizardProgressBar }
