// KyteBaseButton.d.ts

import React, { ComponentProps } from 'react'
import { KyteButton } from '@kyteapp/kyte-ui-components'

type KyteButtonProps = ComponentProps<typeof KyteButton>

interface KyteBaseButtonProps extends KyteButtonProps {
	onPress?: () => void
	children?: string | React.ReactNode
	customChildren?: React.ReactNode
	type?: 'primary' | 'secondary' | 'tertiary' | 'disabled'
}

declare const KyteBaseButton: React.FC<KyteBaseButtonProps>

export default KyteBaseButton
