import React, { ComponentProps } from 'react'
import { Modal } from 'react-native'
import { Container, Body12, Body16, Padding, Row, IconButton } from '@kyteapp/kyte-ui-components'
import { CustomKeyboardAvoidingView } from '../'
import { colors } from '../../../styles'
import { renderBoldText } from '../../../util'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useKeyboardStatus from '../../../hooks/useKeyboardStatus'

interface BottomModalProps {
	isVisible: boolean
	onClose: () => void
	title: string
	description?: string
	children: React.ReactNode
	closeBtnProps?: ComponentProps<typeof IconButton>
	enableDefaultPadding?: boolean
}

const BottomModal = ({
	isVisible,
	onClose,
	title,
	description,
	children,
	closeBtnProps,
	enableDefaultPadding = true,
}: BottomModalProps) => {
	const insets = useSafeAreaInsets()
	const isKeyboardOpen = useKeyboardStatus()
	const modalPadding = 20
	const modalRadius = 15

	const backdropStyle = { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }
	const containerStyle = {
		borderTopLeftRadius: modalRadius,
		borderTopRightRadius: modalRadius,
		paddingBottom: (!isKeyboardOpen ? insets.bottom : 0) + modalPadding,
	}

	return (
		<Modal animationType="slide" visible={isVisible} transparent={true} onRequestClose={onClose}>
			<CustomKeyboardAvoidingView style={backdropStyle}>
				<Container flex={1} />
				<Container style={containerStyle} backgroundColor={colors.white} padding={enableDefaultPadding ? modalPadding : 0}>
					<Row alignItems="center" padding={!enableDefaultPadding ? modalPadding : 0}>
						<Container flex={1}>
							<Body16 weight={'500'}>{title}</Body16>
						</Container>
						<IconButton size={12} name="close-navigation" onPress={onClose} {...closeBtnProps} />
					</Row>
					{!!description && (
						<Padding top={30} bottom={10}>
							<Body12 lineHeight={16}>{renderBoldText(description)}</Body12>
						</Padding>
					)}
					{children}
				</Container>
			</CustomKeyboardAvoidingView>
		</Modal>
	)
}

export default BottomModal
