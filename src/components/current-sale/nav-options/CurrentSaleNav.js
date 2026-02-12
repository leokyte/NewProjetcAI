import React, { Component } from 'react'
import { Alert } from 'react-native'
import { connect } from 'react-redux'
import { KyteToolbar, ToolbarCustomer } from '../../common'
import HeaderButton from '../../common/HeaderButton'
import { MobileOnly } from '@kyteapp/kyte-ui-components'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { productsFetch, currentSaleRenew, saleSave } from '../../../stores/actions'
import { generateTestID } from '../../../util'
import { logEvent } from '../../../integrations'

class CurrentSaleNav extends Component {
	onClickCustomerAdd() {
		const { navigation } = this.props
		logEvent('Checkout Customer Select Click', {
			where: 'checkout',
		})
		navigation.navigate('CustomerAdd', {
			screen: 'CustomerAdd',
			params: { origin: 'checkout' },
		})
	}

	closeCheckoutEdition() {
		this.props.currentSaleRenew()
	}

	checkoutEditionAlert() {
		Alert.alert('', I18n.t('openedSaleWhatToDo'), [
			{ text: I18n.t('discardChanges'), style: 'cancel', onPress: () => this.closeCheckoutEdition() },
			{ text: I18n.t('alertSave'), onPress: () => this.saveEdition() },
		])
	}

	saveEdition() {
		const { currentSale } = this.props

		this.props.saleSave({ currentSale, dontSetSale: true })
		this.props.currentSaleRenew()
	}

	renderCustomer() {
		return <ToolbarCustomer customer={this.props.customer} navigation={this.props.navigation} />
	}

	renderCustomerIcon() {
		return (
			<HeaderButton
				buttonKyteIcon
				size={18}
				icon={'customer-plus'}
				color={colors.actionColor}
				onPress={() => this.onClickCustomerAdd()}
				testProps={generateTestID('add-cust-ck')}
			/>
		)
	}

	renderCustomerContent() {
		const { customer } = this.props

		return <MobileOnly>{customer ? this.renderCustomer() : this.renderCustomerIcon()}</MobileOnly>
	}

	render() {
		const { navigation, EditionMode } = this.props
		const goBack = EditionMode ? () => this.checkoutEditionAlert() : () => navigation.goBack()
		const headerTitle = EditionMode ? I18n.t('openedSalesOptions.editOrder') : I18n.t('sideMenu.currentSale')

		return (
			<KyteToolbar
				innerPage={EditionMode}
				showCloseButton={EditionMode}
				borderBottom={1.5}
				headerTitle={headerTitle}
				navigate={navigation.navigate}
				navigation={navigation}
				goBack={goBack}
				rightComponent={this.renderCustomerContent()}
			/>
			// {/* productCategoryGroupResult.length > 0 ? this.renderCategories() : null */}
		)
	}
}

const mapStateToProps = (state) => {
	return {
		customer: state.currentSale.customer,
		EditionMode: state.common.checkoutEditionMode,
		currentSale: state.currentSale,
	}
}

export default connect(mapStateToProps, { productsFetch, currentSaleRenew, saleSave })(CurrentSaleNav)
