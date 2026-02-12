import React from 'react'
import { Margin } from '@kyteapp/kyte-ui-components';
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row';
import { View } from 'react-native';
import { KyteText } from './KyteText'
import I18n from '../../i18n/i18n'
import { colors } from '../../styles/colors'
import { KyteIcon } from './KyteIcon';

const styles = {
	tag: (isFromNewCatalog) => ({
		backgroundColor: isFromNewCatalog ? colors.primaryLight : colors.actionColor,
		borderRadius: 24,
		paddingVertical: 6,
		paddingHorizontal: 6,
		textColor: isFromNewCatalog ? colors.primaryDark : colors.white,
	}),
	outLine: {
		backgroundColor: 'transparent',
		borderColor: colors.actionColor,
		borderWidth: 1.5,
		borderRadius: 15,
		paddingVertical: 4,
		paddingHorizontal: 8,
		textColor: colors.actionColor,
	},
}

// eslint-disable-next-line import/prefer-default-export
export const KyteTagNew = ({ style = {}, isOutline, isFromNewCatalog, textProps, icon, text }) => {
	const stylesApplied = isOutline ? styles.outLine : styles.tag(isFromNewCatalog)
	const title = isFromNewCatalog ? I18n.t('newCatalog').toUpperCase() : I18n.t('words.s.new').toUpperCase()

	return (
		<Row alignItems='center' style={{ ...stylesApplied, ...style }}>
			{icon && (
				<View>
					<KyteIcon name={icon} size={14} color={textProps.color || stylesApplied.textColor} />
					<Margin right={2} />
				</View>
			)}
			<KyteText color={stylesApplied.textColor} size={9} weight={500} {...textProps }>
				{text || title}
			</KyteText>
			<Margin bottom={3} />
		</Row>
	)
}
