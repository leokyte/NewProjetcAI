import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import { colors } from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import React, { ReactElement } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors as localColors } from '../../styles'

/**
 * KyteWarning - Alert message component with 4 visual variants.
 *
 * Props:
 * - message: string | ReactElement (required)
 * - variant: 'info' | 'subtle' | 'warning' | 'dark' (default: 'info')
 *
 * Usage:
 * <KyteWarning message="Atualizado em 14/05/2024 às 14:40" variant="warning" />
 */
const VARIANT_STYLES = {
	info: {
		backgroundColor: localColors.secondaryUltraLight,
		color: colors.gray02Kyte,
	},
	subtle: {
		backgroundColor: colors.gray07,
		color: colors.gray02Kyte,
	},
	warning: {
		backgroundColor: colors.alert,
		color: colors.gray02Kyte,
	},
	dark: {
		backgroundColor: colors.gray02Kyte,
		color: colors.white,
	},
}

const styles = StyleSheet.create({
	container: {
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	text: {
		fontFamily: 'Graphik-Semibold',
		fontSize: 18,
		textAlign: 'center',
	},
})

type KyteWarningProps = {
	children: string | ReactElement
	type?: 'info' | 'subtle' | 'warning' | 'dark'
}

const KyteWarning = ({ children, type = 'info' }: KyteWarningProps) => {
	const style = VARIANT_STYLES[type] || VARIANT_STYLES.info

	return (
		<View style={[styles.container, { backgroundColor: style.backgroundColor }]}>
			{typeof children === 'string' ? (
				<KyteText weight={500} size={12} color={style.color}>
					{children}
				</KyteText>
			) : (
				children
			)}
		</View>
	)
}

export default KyteWarning
