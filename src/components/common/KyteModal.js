import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import Modal from 'react-native-modal'
import { useIsSmallScreen } from '@kyteapp/kyte-ui-components'
import { modalStyles, headerStyles, colors, Type } from '../../styles'
import HeaderButton from './HeaderButton'
import { KyteIcon } from './KyteIcon'
import { KyteSafeAreaView } from './KyteSafeAreaView'
import { generateTestID } from '../../util'

const KyteModal = ({ ...props }) => {
	const { modalButtons, buttonNormal, buttonWhite } = modalStyles
	const isMobile = useIsSmallScreen()
	const isBottomPage = props.bottomPage && isMobile
	const isFullPage = props.fullPage && isMobile

	const footerButtons = (buttonType) => {
		const buttons = props.modalButtons || props.backdropButtons
		return buttons.map((button, i) => (
			<TouchableOpacity onPress={button.onPress} key={i} activeOpacity={0.8}>
				<View style={modalButtons}>
					<Text style={buttonType}>{button.title}</Text>
				</View>
			</TouchableOpacity>
		))
	}

	const renderFooter = (buttonType, customStyle) => (
		<View style={[modalStyles.modalFooter, customStyle]}>{footerButtons(buttonType)}</View>
	)

	const renderHeader = () => {
		const closeIcon = props.closeIcon || {}

		return (
			<View style={{ ...modalStyles.modalHeader, ...props.headerStyle }}>
				{props.headerLeftIcon || null}

				{props.title && (
					<Text style={[modalStyles.modalTitle, props.titleStyle]} {...generateTestID('modal-title')}>
						{props.title}
					</Text>
				)}

				{props.hideModal && (
					<TouchableOpacity
						onPress={props.hideModal}
						hitSlop={{ left: 15, right: 15, bottom: 5 }}
						activeOpacity={1}
						{...generateTestID('modal-close')}
					>
						<KyteIcon
							name={closeIcon.name || 'close-navigation'}
							size={closeIcon.size || 16}
							style={modalStyles.modalClose}
						/>
					</TouchableOpacity>
				)}
			</View>
		)
	}

	const renderFullPageHeader = () => {
		const containerStyle = { flex: 1, alignItems: 'flex-end', paddingHorizontal: 15 }
		const renderRightIcons = () => (
			<View style={containerStyle}>
				{props.rightIcons.map((eachIcon, key) => (
					<TouchableOpacity
						key={key}
						onPress={() => eachIcon.onPress()}
						activeOpacity={0.8}
						disabled={eachIcon.disabled}
					>
						<KyteIcon
							name={eachIcon.icon || 'plus-calculator'}
							color={eachIcon.color || colors.actionColor}
							size={eachIcon.iconSize || 18}
						/>
					</TouchableOpacity>
				))}
			</View>
		)
		const renderRightButtons = () => (
			<View
				style={{
					flex: 1,
					justifyContent: 'flex-end',
					alignItems: 'flex-end',
					paddingHorizontal: 15,
				}}
			>
				{props.rightButtons.map((button, key) => (
					<TouchableOpacity key={key} onPress={() => button.onPress()} activeOpacity={0.8}>
						<Text
							style={[
								Type.Medium,
								Type.fontSize(15),
								{ color: button.color || colors.actionColor, paddingVertical: 15 },
							]}
						>
							{button.title}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		)
		return (
			<View style={headerStyles.headerBase(1)}>
				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
					<HeaderButton
						icon={props.fullPageTitleIcon || 'close'}
						color={colors.terciaryColor}
						onPress={props.hideFullPage}
						buttonKyteIcon={!!props.fullPageTitleIcon}
					/>
					<Text style={[headerStyles.headerTitleStyle, props.headerTitleStyle]}>{props.fullPageTitle}</Text>
				</View>
				{props.rightIcons ? renderRightIcons() : null}
				{props.rightButtons ? renderRightButtons() : null}
			</View>
		)
	}

	const renderBackdropeHeader = () => (
		<View style={modalStyles.backdropHeader}>
			<HeaderButton icon="close" color="#FFF" onPress={props.hideModal} />
		</View>
	)

	const renderBody = () => (
		<View
			style={[
				modalStyles.modalBody(isBottomPage || props.noPadding ? 0 : 15, props.topRadius),
				{ flex: props.height === 'auto' ? 0 : 1 },
			]}
		>
			{props.children}
		</View>
	)

	const renderBackdropFooter = () => (
		<View style={modalStyles.backdropFooter}>{renderFooter(buttonWhite, { borderTopWidth: 0 })}</View>
	)

	const renderSlider = () => (
		<View style={modalStyles.modalSliderIndicatorRow}>
			<View style={modalStyles.modalSliderIndicator} />
		</View>
	)

	return (
		<Modal
			avoidKeyboard={props.avoidKeyboard || false}
			isVisible={props.isModalVisible}
			backdropColor={isFullPage ? '#FFF' : colors.darkGrey}
			backdropOpacity={isFullPage ? 1 : props.opacity || 0.8}
			onBackdropPress={!props.dontCloseOnBackdropClick ? props.hideModal : null}
			hideOnBack={props.hideOnBack}
			onDismiss={props.onDismiss ? props.onDismiss : null}
			swipeDirection={props.swipeDirection}
			useNativeDriverForBackdrop
			propagateSwipe={props.propagateSwipe}
			onSwipeComplete={props.swipeDirection ? () => props.onSwipeComplete() : null}
			coverScreen={props.coverScreen}
			style={[modalStyles.modalShadow, isFullPage || isBottomPage ? { margin: 0, justifyContent: 'flex-end' } : '']}
		>
			{props.backdropHeader ? renderBackdropeHeader() : null}
			<KyteSafeAreaView
				style={[
					modalStyles.modalBase(
						props.height,
						isBottomPage ? 0 : props.border || 4,
						isFullPage || isBottomPage || props.noEdges ? 0 : 15,
						props.topRadius,
						props.width,
						isMobile
					),
					props.transparent ? { backgroundColor: 'transparent' } : {},
					props.bottomRadius ? { borderBottomLeftRadius: props.bottomRadius, borderBottomRightRadius: props.bottomRadius } : {},
					{...props.containerStyle}
				]}
			>
				{props.fullPageTitle ? renderFullPageHeader() : null}
				{props.useSlider ? renderSlider() : null}
				{props.title ? renderHeader() : null}
				{isFullPage ? props.children : renderBody()}
				{props.modalButtons ? renderFooter(buttonNormal) : null}
			</KyteSafeAreaView>
			{props.backdropButtons ? renderBackdropFooter() : null}
		</Modal>
	)
}

export { KyteModal }
