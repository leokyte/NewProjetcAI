import IconButton from '@kyteapp/kyte-ui-components/src/packages/buttons/icon-button/IconButton'
import KyteButton from '@kyteapp/kyte-ui-components/src/packages/buttons/kyte-button/KyteButton'
import Checkbox from '@kyteapp/kyte-ui-components/src/packages/form/checkbox/Checkbox'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding'
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import Body12 from '@kyteapp/kyte-ui-components/src/packages/text/typography/body12/Body12'
import Body16 from '@kyteapp/kyte-ui-components/src/packages/text/typography/body16/Body16'
import Body18 from '@kyteapp/kyte-ui-components/src/packages/text/typography/body18/Body18'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Modal, { ModalProps } from 'react-native-modal'

interface ConsentModalProps extends Partial<ModalProps> {
	texts: {
		title: string
		description: string
		btnConsent: string
		btnConfirm: string
		btnCancel: string
	}
	onCancel: () => void
	onConfirm: () => void
}

const styles = StyleSheet.create({
	modalStyle: {
		alignItems: 'center',
	},
	btnConsent: {
		backgroundColor: colors.gray10,
		padding: 20,
		borderRadius: 8,
	},
	btnConfirmText: {
		fontWeight: '700',
	},
	btnCancelText: {
		fontWeight: '700',
	},
	checkBox: {
		margin: 0,
		marginRight: 0,
	},
})

const ConsentModal: React.FC<ConsentModalProps> = ({ texts, onCancel: handleCancel, onConfirm, ...props }) => {
	const [didConsent, setDidConsent] = useState(false)
	const onCancel = useCallback(() => {
		setDidConsent(false)
		handleCancel()
	}, [handleCancel])

	const defaultProps: Partial<ModalProps> = useMemo(
		() => ({
			isVisible: true,
			backdropOpacity: 0.8,
			onDismiss: onCancel,
			style: styles.modalStyle,
			onBackdropPress: onCancel,
		}),
		[onCancel]
	)

	useEffect(() => {
		if (!props.isVisible) setDidConsent(false)
	}, [props.isVisible])

	return (
		<Modal {...defaultProps} {...props}>
			<Container backgroundColor={colors.white} borderRadius={6}>
				<Padding vertical={8} horizontal={16}>
					<Row justifyContent="flex-end">
						<IconButton name="close-navigation" size={16} onPress={onCancel} />
					</Row>
				</Padding>
				<Container>
					<Padding all={24}>
						<Body18 weight={500} textAlign="center">
							{texts.title}
						</Body18>
						<Body16 textAlign="center" lineHeight={24}>
							{texts.description}
						</Body16>
					</Padding>
					<Padding all={16}>
						<TouchableOpacity style={styles.btnConsent} onPress={() => setDidConsent(!didConsent)}>
							<Row alignItems="center">
								<Checkbox
									active={didConsent}
									onPress={() => setDidConsent(!didConsent)}
									checkboxProps={styles.checkBox}
								/>
								<Margin left={12}>
									<Body12 lineHeight={14}>{texts.btnConsent}</Body12>
								</Margin>
							</Row>
						</TouchableOpacity>
						<Margin top={16}>
							<KyteButton
								disabledButton={!didConsent}
								backgroundColor={didConsent ? colors.red : colors.disable03}
								textColor={didConsent ? colors.white : colors.disable01}
								onPress={onConfirm}
								textStyle={styles.btnConfirmText}
							>
								{texts.btnConfirm}
							</KyteButton>
						</Margin>
						<Margin top={16}>
							<KyteButton type="tertiary" textStyle={styles.btnCancelText} onPress={onCancel} textColor={colors.gray03}>
								{texts.btnCancel}
							</KyteButton>
						</Margin>
					</Padding>
				</Container>
			</Container>
		</Modal>
	)
}

export default ConsentModal
