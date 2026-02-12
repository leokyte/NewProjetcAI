import React, { Component } from 'react'
import { View, Alert } from 'react-native'
import { connect } from 'react-redux'
import _ from 'lodash'

import { DetailPage, SearchBar, ActionButton, LoadingCleanScreen } from '../../common'
import I18n from '../../../i18n/i18n'
import {
	customersGetContacts,
	customersSelectContact,
	customersUnselectContact,
	customersCleanContacts,
	customersImportContacts,
	customersSelectAllContacts,
	startLoading,
	stopLoading,
} from '../../../stores/actions'
import CustomerFlatList from '../common/CustomerFlatList'
import { colors, scaffolding } from '../../../styles'
import { generateTestID, requestPermission } from '../../../util'
import { logEvent } from '../../../integrations/Firebase-Integration'
import { CONTACTS } from '../../../enums'

class CustomerImportContainer extends Component {
	static navigationOptions = () => {
		return {
			header: null,
		}
	}

	constructor(props) {
		super(props)
		this.state = {
			contacts: [],
			isSearchBarVisible: false,
			searchTerm: '',
			allItemsSelected: false,

			rightButtons: [
				{
					icon: 'check-box-outline-blank',
					color: colors.actionColor,
					onPress: () => this.selectAllContacts(),
					iconSize: 18,
					testProps: generateTestID('check-csr'),
				},
			],
		}
	}

	async UNSAFE_componentWillMount() {
		const hasPermission = await requestPermission(CONTACTS)
		hasPermission && this.props.customersGetContacts()
	}

	componentDidMount() {
		Alert.alert(I18n.t('customerImportContactsWarningTitle'), I18n.t('customerImportContactsWarningText'), [
			{ text: I18n.t('words.s.ok') },
		])
		logEvent('Customer Import Start')
	}

	componentWillUnmount() {
		this.props.customersCleanContacts()
		clearTimeout(this.timer)
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (!_.isEqual(nextProps.customers.contacts, this.state.contacts)) {
			this.setState({ contacts: nextProps.customers.contacts })
		}
	}

	toggleSearch() {
		const { isSearchBarVisible } = this.state
		this.setState({ isSearchBarVisible: !isSearchBarVisible })
	}

	closeSearch() {
		this.setState({ isSearchBarVisible: false })
		this.searchContactsByTerm('')
	}

	searchContactsByTerm(text) {
		this.setState({ searchTerm: text.toLowerCase() })
	}

	renderContactsList() {
		const { searchTerm, contacts } = this.state
		let finalContacts = []
		contacts.forEach((eachContact) => {
			if (!searchTerm) {
				finalContacts.push(eachContact)
				return
			}
			if (
				(eachContact.name && eachContact.name.toLowerCase().includes(searchTerm)) ||
				(eachContact.celPhone && eachContact.celPhone.includes(searchTerm)) ||
				(eachContact.phone && eachContact.phone.includes(searchTerm))
			) {
				finalContacts.push(eachContact)
				return
			}
		})

		const selectItem = ({ id }) => {
			this.props.customersSelectContact(id)
		}

		return <CustomerFlatList data={finalContacts} onPress={selectItem.bind(this)} type="contacts" />
	}

	importContacts() {
		const { goBack } = this.props.navigation

		this.props.startLoading()
		this.timer = setTimeout(() => {
			this.props.customersImportContacts().then((qtyImportedContacts) => {
				this.props.stopLoading()
				logEvent('Customer Import Complete', { created_customers: qtyImportedContacts })
				goBack()
			})
		}, 100)
	}

	selectAllContacts() {
		const { allItemsSelected, searchTerm, contacts } = this.state
		let finalContacts = []
		contacts.forEach((eachContact) => {
			if (!searchTerm) {
				finalContacts.push(eachContact.id)
				return
			}
			if (
				(eachContact.name && eachContact.name.toLowerCase().includes(searchTerm)) ||
				(eachContact.celPhone && eachContact.celPhone.includes(searchTerm)) ||
				(eachContact.phone && eachContact.phone.includes(searchTerm))
			) {
				finalContacts.push(eachContact.id)
				return
			}
		})

		this.props.customersSelectAllContacts(!allItemsSelected, finalContacts)
		this.setState({
			allItemsSelected: !allItemsSelected,
			rightButtons: [
				{
					icon: !allItemsSelected ? 'check-box' : 'check-box-outline-blank',
					color: colors.actionColor,
					onPress: () => this.selectAllContacts(),
					iconSize: 18,
				},
			],
		})
	}

	renderLoader() {
		return <LoadingCleanScreen text={I18n.t('customerImportContactsLoading')} />
	}

	render() {
		const { visible } = this.props.loader
		const { goBack } = this.props.navigation
		const { contacts } = this.props.customers
		const { rightButtons } = this.state
		const { bottomContainer } = scaffolding
		const countSelected = _.filter(contacts, (eachContact) => eachContact.selected)
		const buttonLabel =
			countSelected.length > 0
				? `${I18n.t('customerImportContactsButton')} (${countSelected.length})`
				: I18n.t('customerImportContactsButton')

		return (
			<DetailPage
				pageTitle={I18n.t('customerImportTitle')}
				goBack={goBack}
				rightButtons={rightButtons}
				useCommonIcon
				showCloseButton
			>
				<SearchBar
					isOpened={this.state.isSearchBarVisible}
					openedPlaceholder={I18n.t('customerSearchPlaceholderActive')}
					closedPlaceholder={I18n.t('customerSearchPlaceholder')}
					toggleSearch={this.toggleSearch.bind(this)}
					closeSearchAction={this.closeSearch.bind(this)}
					searchAction={this.searchContactsByTerm.bind(this)}
				/>
				{this.renderContactsList()}
				<View style={bottomContainer}>
					<ActionButton
						onPress={() => this.importContacts()}
						disabled={countSelected.length <= 0}
						testProps={generateTestID('import-sel-csr')}
					>
						{buttonLabel}
					</ActionButton>
				</View>
				{visible ? this.renderLoader() : null}
			</DetailPage>
		)
	}
}

const mapStateToProps = (state) => ({
	customers: state.customers,
	loader: state.common.loader,
})

export default connect(mapStateToProps, {
	customersGetContacts,
	customersSelectContact,
	customersSelectAllContacts,
	customersUnselectContact,
	customersCleanContacts,
	customersImportContacts,
	startLoading,
	stopLoading,
})(CustomerImportContainer)
