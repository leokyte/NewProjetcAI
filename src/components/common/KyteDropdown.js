import React, { Component } from 'react'
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native'
import { colors, formStyle, Type } from '../../styles'
import { isIphoneX, generateTestID } from '../../util'
import { KyteIcon, KyteText } from "."

class KyteDropdown extends Component {
	constructor(props) {
		super(props)

		this.state = {
			showOptions: false,
		}
	}

	renderModal() {
		const { showOptions } = this.state
		const { options, checkedIndex } = this.props
		const { modalContainer } = style

		const renderCloseButton = () => (
			<View style={style.closeButtonView}>
				<TouchableOpacity onPress={() => this.setState({ showOptions: false })}>
					<KyteIcon name="close-navigation" size={16} color={colors.primaryColor} />
				</TouchableOpacity>
			</View>
		)

		const renderOptionIcon = (icon) => <KyteIcon name={icon.name} color={icon.color} size={30} />
		const renderCheckIcon = () => (
			<KyteIcon name="check" color={colors.actionColor} size={16} testProps={generateTestID('sel-status-cops')} />
		)

		const renderOptionRow = (option, i) => (
			<TouchableOpacity
				key={i}
				onPress={() => {
					this.setState({ showOptions: false })
					option.onPress()
				}}
			>
				<View style={[style.optionRowView, i ? { borderTopWidth: 1, borderColor: colors.lightBorder } : {}]}>
					<View style={style.optionIconView}>{option.icon ? renderOptionIcon(option.icon) : null}</View>
					<View style={{ flex: 1 }} {...generateTestID(`${option.title}-cops`)}>
						<Text style={[Type.Medium, { color: colors.primaryColor, fontSize: 15 }]}>{option.title}</Text>
						{option.subtitle != null && (
							<Text style={[Type.Regular, { color: colors.primaryColor, fontSize: 12 }]}>{option.subtitle}</Text>
						)}
					</View>
					<View style={{ ...style.optionIconView, paddingRight: defaultPadding }}>
						{checkedIndex === i ? renderCheckIcon() : null}
					</View>
				</View>
			</TouchableOpacity>
		)

		return (
			<Modal transparent visible={showOptions} onRequestClose={() => this.setState({ showOptions: false })}>
				<View style={[modalContainer, { paddingBottom: isIphoneX() ? 40 : 0 }]}>
					<TouchableOpacity
						style={{ flex: 1, backgroundColor: 'black', opacity: 0.5 }}
						onPress={() => this.setState({ showOptions: false })}
					/>
					<View style={{ backgroundColor: '#FFF' }}>
						{false ? renderCloseButton() : null}
						{options.map((option, i) => renderOptionRow(option, i))}
					</View>
				</View>
			</Modal>
		)
	}

	render() {
		const { options, checkedIndex, testProps, testProps1, shouldHideLeftIcon, mainViewProps, placeholder } = this.props

		return (
			<View>
				<TouchableOpacity onPress={() => this.setState({ showOptions: true })} {...testProps}>
					{placeholder && options[checkedIndex]?.labelText  && <View style={{ ...formStyle.labelContainer, marginBottom: 8}}><Text style={formStyle.inputLabel}>{placeholder}</Text></View>}
					<View {...mainViewProps} style={[style.mainView, mainViewProps?.style]}>
						{!shouldHideLeftIcon && (
							<KyteIcon
								name="clock-stroke-small"
								size={18}
								style={[style.mainLabel, style.iconPosition]}
								color={colors.primaryColor}
							/>
						)}
						{placeholder && !options[checkedIndex]?.labelText
							? <KyteText size={16} color={colors.tipColor}>{placeholder}</KyteText>
							: (<KyteText size={15} style={style.mainLabel} {...testProps1}>
									{options[checkedIndex].labelText}
								</KyteText>)
							}
						
						<KyteIcon name="nav-arrow-down" style={style.iconPosition} size={12} color={colors.primaryColor} />
					</View>
				</TouchableOpacity>
				{this.renderModal()}
			</View>
		)
	}
}
const defaultPadding = 20
const style = {
	mainView: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 7,
		paddingHorizontal: 8,
	},
	mainLabel: {
		marginRight: 12,
	},
	iconPosition: {
		position: 'relative',
		top: Platform.OS === 'ios' ? -2 : 1,
	},
	closeButtonView: {
		paddingVertical: 25,
		paddingHorizontal: defaultPadding,
		alignItems: 'flex-end',
	},
	optionRowView: {
		flexDirection: 'row',
		paddingVertical: 20,
	},
	optionIconView: {
		paddingLeft: defaultPadding,
		paddingRight: 13,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalContainer: {
		flex: 1,
		flexDirection: 'column',
	},
}

export { KyteDropdown }
