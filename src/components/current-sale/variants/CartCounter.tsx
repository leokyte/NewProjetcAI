import React from 'react'
import { Container, KyteText } from '@kyteapp/kyte-ui-components'
import { colors } from '../../../styles';

const CartCounter = ({ amount = 0, isFractioned = false }: { amount: number; isFractioned?: boolean }) => {
	const counterSize = 32
	return (
		<Container
			alignItems="center"
			justifyContent="center"
			width={amount > 0 ? counterSize : 0}
			height={amount > 0 ? counterSize : 0}
			borderRadius={2}
			overflow="hidden"
			backgroundColor={colors.actionColor}
		>
			<KyteText color={colors.white} size={14} weight={500} numberOfLines={1} ellipsizeMode="clip">
				{amount}
				{isFractioned && 'x'}
			</KyteText>
		</Container>
	)
}

export default CartCounter
