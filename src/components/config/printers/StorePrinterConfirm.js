import React, { Component } from 'react'
import { Dimensions, View, Text, Image, TouchableOpacity, Platform, Switch } from 'react-native'
import { connect } from 'react-redux'
import { BleManager } from 'react-native-ble-plx'
import { Icon } from 'react-native-elements'
import _ from 'lodash'
import { colors, colorSet, scaffolding, Type } from '../../../styles'
import { DetailPage, ActionButton, LoadingCleanScreen, Input, KyteModal, KyteList, SwitchContainer } from '../../common'
import { PrinterFound, PrinterError } from '../../../../assets/images'
import {
	connectToDevice,
	disconnectDevice,
	removeDevice,
	updateDevicePaperType,
	updateDeviceTextSize,
	setPrinterRepeatNumber,
} from '../../../stores/actions'
import I18n from '../../../i18n/i18n'
import { logEvent } from '../../../integrations'
import { KytePrint } from '../../../integrations/Print/KytePrint'
import { KyteSwitch } from '@kyteapp/kyte-ui-components'

class StorePrinterConfirm extends Component {
	static navigationOptions = () => ({
		header: null,
	})

	constructor(props) {
		super(props)

		this.state = {
			isPrinting: false,
			isSelectingPaper: false,
			rightButtons: [
				{
					icon: 'trash',
					color: colors.primaryColor,
					onPress: () => this.removePrinter(),
					iconSize: 20,
				},
			],
			paperOptions: [
				{ name: '58mm', selected: false, id: 0, type: 'paper' },
				{ name: '80mm', selected: true, id: 1, type: 'paper' },
			],
		}
	}

	UNSAFE_componentWillMount() {
		const { printer } = this.props
		const { paperOptions } = this.state

		const originalPaperOptions = _.clone(paperOptions)
		paperOptions.forEach((eachOption, index) => {
			originalPaperOptions[index] = { ...eachOption, selected: eachOption.id === printer.paperTypeId }
		})
		this.setState({ paperOptions: originalPaperOptions })
	}

	componentDidMount() {
		logEvent('Print Confirmed')
	}

	componentWillUnmount() {
		const { id } = this.props.printer
		const manager = new BleManager()
		if (id) {
			manager.isDeviceConnected(id).then((connected) => {
				if (connected) {
					manager.cancelDeviceConnection(id)
				}
			})
		}
	}

	toggleLoading(status) {
		this.setState({ isPrinting: status })
	}

	printTest() {
		const { id, type, paperTypeId, name } = this.props.printer
		const paperType = paperTypeId === 1 ? '80mm' : '58mm'

		const kytePrint = new KytePrint(paperType, id, type, name)
		this.toggleLoading(true)
		kytePrint
			.generatePrinterTest()
			.print()
			.then(() => this.toggleLoading(false))
			.catch((error) => this.toggleLoading(false))
	}

	removePrinter() {
		this.props.removeDevice()
		this.props.navigation.pop(2)
	}

	renderModal() {
		const { isSelectingPaper, paperOptions, textSizeOptions } = this.state
		const setOption = (item) => {
			const originalPaperOptions = _.clone(paperOptions)

			paperOptions.forEach((eachOption, index) => {
				originalPaperOptions[index] = { ...eachOption, selected: eachOption.id === item.id }
			})
			this.props.updateDevicePaperType(item.id)

			this.setState({ paperOptions: originalPaperOptions, isSelectingPaper: false })
		}

		return (
			<KyteModal
				bottomPage
				height="auto"
				title={isSelectingPaper ? I18n.t('storePrinterPaperTypeLabel') : I18n.t('storePrinterTextSizeLabel')}
				isModalVisible={isSelectingPaper}
				hideModal={() => this.setState({ isSelectingPaper: false })}
			>
				<View>
					<KyteList
						data={isSelectingPaper ? paperOptions : textSizeOptions}
						onPress={setOption.bind(this)}
						type="printerOptions"
					/>
				</View>
			</KyteModal>
		)
	}

	renderPositivePairing() {
		const { topContainer, fieldContainer, infoStyle, svgImage } = styles
		const { pairing } = this.props.route.params
		const { printer } = this.props
		const selectedPaperType = _.find(this.state.paperOptions, (paper) => {
			return paper.selected
		})

		return (
			<View style={{ flex: 1.2, justifyContent: 'center' }}>
				<View style={topContainer}>
					<Text style={infoStyle}>{pairing.name}</Text>
					<Image style={{ ...svgImage, marginLeft: 10 }} source={{ uri: PrinterFound }} />
				</View>
				<View style={[fieldContainer, { paddingHorizontal: 20 }]}>
					<TouchableOpacity onPress={() => this.setState({ isSelectingPaper: true })} activeOpacity={0.8}>
						<View pointerEvents="none">
							<Input
								placeholder={I18n.t('storePrinterPaperTypeLabel')}
								placeholderColor={colors.primaryGrey}
								component={this.renderField}
								rightIcon={<Icon name="chevron-right" color={colors.secondaryBg} size={28} />}
								rightIconStyle={{ position: 'absolute', right: -10, bottom: 15 }}
								style={Platform.select({ ios: { height: 32 } })}
								value={selectedPaperType.name}
							/>
						</View>
					</TouchableOpacity>

					<SwitchContainer
						title={I18n.t('storePrinterPrintTwice')}
						onPress={() => this.props.setPrinterRepeatNumber()}
						style={{
							paddingHorizontal: 0,
							borderBottomWidth: 0,
							borderBottomColor: colors.primaryGrey,
						}}
						titleStyle={[Type.fontSize(13), Type.Regular, colorSet(colors.secondaryBg)]}
					>
						<KyteSwitch onValueChange={() => this.props.setPrinterRepeatNumber()} active={printer.repeatPrint >= 2} />
					</SwitchContainer>
				</View>
				{this.renderModal()}
			</View>
		)
	}

	renderNegativePairing() {
		const { topContainer, fieldContainer, infoStyle, svgImage } = styles
		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<View style={topContainer}>
					<Image style={svgImage} source={{ uri: PrinterError }} />
				</View>
				<View style={fieldContainer}>
					<Text style={[infoStyle, { fontSize: 15 }]}>{I18n.t('storePrinterNoPrinterFound')}</Text>
					<Text style={[infoStyle, { fontFamily: 'Graphik-Regular', fontSize: 13 }]}>
						{I18n.t('storePrinterCheckIfOk')}
					</Text>
				</View>
			</View>
		)
	}

	renderLoader() {
		return <LoadingCleanScreen text={I18n.t('storePrinterPrinting')} />
	}

	render() {
		const { bottomContainer } = scaffolding
		const { goBack } = this.props.navigation
		const { pairing } = this.props.route.params
		const { isPrinting, rightButtons } = this.state

		return (
			<DetailPage
				pageTitle={I18n.t('configMenus.printer')}
				goBack={() => this.props.navigation.pop(2)}
				rightButtons={rightButtons}
			>
				{pairing?.id ? this.renderPositivePairing() : this.renderNegativePairing()}
				<View style={bottomContainer}>
					<ActionButton onPress={pairing ? () => this.printTest() : () => goBack()}>
						{pairing ? I18n.t('storePrinterTest') : I18n.t('storePrinterTestFail')}
					</ActionButton>
				</View>
				{isPrinting ? this.renderLoader() : null}
			</DetailPage>
		)
	}
}

const styles = {
	topContainer: {
		flex: 2,
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
		paddingVertical: 20,
	},
	fieldContainer: {
		flex: 1,
		justifyContent: 'flex-end',
		paddingTop: 10,
	},
	infoStyle: {
		fontFamily: 'Graphik-Regular',
		fontSize: 23,
		textAlign: 'center',
		color: colors.secondaryBg,
	},
	svgImage: {
		flex: 1,
		width: '100%',
		height: '100%',
		maxWidth: Dimensions.get('window').width * 0.4,
		maxHeight: Dimensions.get('window').height * 0.4,
		resizeMode: 'contain',
	},
}

const mapStateToProps = (state) => ({
	printer: state.printer,
})

export default connect(mapStateToProps, {
	connectToDevice,
	disconnectDevice,
	removeDevice,
	updateDevicePaperType,
	updateDeviceTextSize,
	setPrinterRepeatNumber,
})(StorePrinterConfirm)
