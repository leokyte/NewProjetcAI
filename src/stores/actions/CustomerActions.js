import { Alert } from 'react-native'
import Contacts from 'react-native-contacts'
import _ from 'lodash'
import {
	CUSTOMERS_FETCH,
	CURRENT_SALE_ADD_CUSTOMER,
	CUSTOMER_DETAIL,
	CUSTOMER_REMOVE,
	CUSTOMER_SAVE,
	CUSTOMERS_GET_CONTACTS,
	CUSTOMERS_SELECT_CONTACT,
	CUSTOMERS_SELECT_ALL_CONTACTS,
	CUSTOMERS_CLEAN_CONTACTS,
	CUSTOMER_MANAGE_NEW_BALANCE,
	CUSTOMER_MANAGE_ACTUAL_BALANCE,
	CUSTOMER_ACCOUNT_EDIT_BALANCE,
	CUSTOMER_ACCOUNT_EDIT_PAYMENT,
	CUSTOMER_ACCOUNT_GET_STATEMENTS,
	CUSTOMER_ACCOUNT_RESET_BALANCE,
	CUSTOMERS_ACCOUNT_GENERAL_FILTER_SET,
	CUSTOMERS_ACCOUNT_GENERAL_FILTER_CLEAR,
	CUSTOMERS_ACCOUNT_FILTER_SET,
	CUSTOMERS_ACCOUNT_FILTER_CLEAR,
	CUSTOMERS_FETCH_STATEMENTS,
	CUSTOMERS_FILTER_TABS_SET,
	CUSTOMERS_SET_BALANCE_TOTALS,
	CUSTOMER_DETAIL_SET_LOADING,
	CUSTOMER_ACCOUNT_UPDATE_BALANCE,
	CUSTOMER_ACCOUNT_CANCEL_STATEMENT,
	COMMON_REFRESH_CUSTOMER_STATEMENTS,
	CUSTOMERS_CLEAR,
} from './types'

import {
	fetch,
	fetchByTerm,
	save,
	insertMany,
	remove,
	fetchOneByID,
	fetchSaleByCustomer,
	CUSTOMER,
} from "../../repository"
import {
	kyteCustomerAccountEdit,
	kyteCustomerAccountStatements,
	kyteAccountStatements,
	kyteCustomerAccountStatementsCancel,
} from '../../services'
import { formatPeriod, xor, calcTotalBalance } from '../../util'
import { DetailOrigin } from "../../enums"
import { startLoading, stopLoading , preferenceAddCoreAction } from "."
import { CoreAction } from '../../enums/Subscription.ts'
import I18n from '../../i18n/i18n'

const customerFetchOrderBy = (data, orderBy) => {
	if (!orderBy) return data
	if (orderBy === 'pay-later') {
		return [
			..._(data)
				.filter((d) => !d.accountBalance || d.accountBalance <= 0)
				.orderBy(['name'], ['asc']),
			..._(data)
				.filter((d) => d.accountBalance > 0)
				.orderBy(['name'], ['asc']),
		]
	}
	return [
		..._(data)
			.filter((d) => d.accountBalance > 0)
			.orderBy(['name'], ['asc']),
		..._(data)
			.filter((d) => !d.accountBalance || d.accountBalance <= 0)
			.orderBy(['name'], ['asc']),
	]
}

const setCustomerSales = (customers) => {
	const customerList = []
	customers.forEach((customer) => {
		const customerSales = (setValues) =>
			fetchSaleByCustomer(customer.id).then((sales) => {
				const salesType = (type) => sales.filter((s) => s.status === type)
				const sumValues = (arr) => _.sumBy(arr, (s) => Number(s.totalNet))

				setValues({
					amountClosed: salesType('closed').length,
					amountOpened: salesType('opened').length,
					averageTicket: sumValues(salesType('closed')) / salesType('closed').length,
					totalClosed: sumValues(salesType('closed')),
					totalOpened: sumValues(salesType('opened')) + sumValues(salesType('confirmed')),
				})
			})

		customerList.push({ ...customer.clone(), sales: customerSales })
	})

	return customerList
}

export const customersFetch = (callback, orderBy = null) => (dispatch) => {
		fetch(CUSTOMER).then((payload) => {
			const customers = customerFetchOrderBy(payload, orderBy)
			const balanceTotals = calcTotalBalance(payload)
			const customersWithSales = setCustomerSales(customers)

			dispatch({ type: CUSTOMERS_FETCH, payload: customersWithSales })
			dispatch({ type: CUSTOMERS_SET_BALANCE_TOTALS, payload: balanceTotals })

			if (callback) callback()
		})
	}

export const customersFetchByTerm = (text) => (dispatch) => {
		fetchByTerm(CUSTOMER, text, ['name', 'email', 'phone']).then((payload) => {
			dispatch({ type: CUSTOMERS_FETCH, payload })
		})
	}

export const customerDetailBySale = () => ({
	type: CUSTOMER_DETAIL,
	payload: {
		customer: { name: '', accountBalance: 0, allowPayLater: false },
		detailOrigin: DetailOrigin.BY_SALE,
	},
})

export const customerFetchById = (customerId) => {
	const customer = fetchOneByID(CUSTOMER, customerId)
	return (dispatch) =>
		dispatch({
			type: CUSTOMER_DETAIL,
			payload: { customer: { ...customer.clone() }, detailOrigin: DetailOrigin.UPDATE },
		})
}

export const customerDetailCreate = () => ({
	type: CUSTOMER_DETAIL,
	payload: {
		customer: { name: '', accountBalance: 0, allowPayLater: false },
		detailOrigin: DetailOrigin.CREATE,
	},
})

export const customerDetailUpdate = (customer) => ({
	type: CUSTOMER_DETAIL,
	payload: { customer: { ...customer }, detailOrigin: DetailOrigin.UPDATE },
})

export const customerCreateBySale = (customer, cb) => (dispatch) => {
		save(CUSTOMER, customer).then((savedCustomer) => {
			const clonedCustomer = { ...savedCustomer.clone() }
			dispatch({ type: CURRENT_SALE_ADD_CUSTOMER, payload: clonedCustomer })
			dispatch(preferenceAddCoreAction(CoreAction.FirstCustomer))
			cb(clonedCustomer)
		})
	}

export const customerManageNewBalance = (type, value) => (dispatch) =>
	dispatch({
		type: CUSTOMER_MANAGE_NEW_BALANCE,
		payload: { type, value },
	})

export const customerManageActualBalance = (type, value) => (dispatch) =>
	dispatch({
		type: CUSTOMER_MANAGE_ACTUAL_BALANCE,
		payload: { type, value },
	})

export const customerAccountEditPayment = (paymentType) => (dispatch) =>
	dispatch({
		type: CUSTOMER_ACCOUNT_EDIT_PAYMENT,
		payload: paymentType,
	})

export const customerAccountResetBalance = (actualBalance) => (dispatch) => dispatch({
		type: CUSTOMER_ACCOUNT_RESET_BALANCE,
		payload: actualBalance,
	})

export const customerSave = (customer, cb) => (dispatch, getState) => {
		const cs = getState().currentSale

		save(CUSTOMER, customer).then((savedCustomer) => {
			if (cs.customer && cs.customer.id === customer.id)
				dispatch({ type: CURRENT_SALE_ADD_CUSTOMER, payload: { ...savedCustomer.clone() } })
			dispatch(preferenceAddCoreAction(CoreAction.FirstCustomer))
		})
		dispatch({ type: CUSTOMER_SAVE })
		cb()
	}

export const customerRemove = (id, callback) => (dispatch) => {
		remove(CUSTOMER, id)
		dispatch({ type: CUSTOMER_REMOVE })
		callback()
	}

export const customerAccountEditBalance = (newBalance, successCb, errorCb) => (dispatch, getState) => {
		dispatch(startLoading())
		const { aid } = getState().auth
		const cs = getState().currentSale

		// Set Customer Balance
		kyteCustomerAccountEdit(newBalance)
			.then((balanceRes) => {
				const updatedCustomer = balanceRes.data

				// Update Customer on sale
				if (cs.customer && cs.customer.id === updatedCustomer.id)
					dispatch({ type: CURRENT_SALE_ADD_CUSTOMER, payload: { ...updatedCustomer } })

				// Fetch Customer Statements (with the newBalance)
				kyteCustomerAccountStatements(updatedCustomer.id, { aid }).then((statementsRes) => {
					// const statements = statementsRes.data;

					dispatch({
						type: CUSTOMER_ACCOUNT_EDIT_BALANCE,
						// payload: { ...updatedCustomer, accountStatements: statements },
						payload: { ...updatedCustomer, accountStatements: [] },
					})
					if (successCb) successCb()
					dispatch(stopLoading())
				})
			})
			.catch((error) => {
				if (errorCb) errorCb()
				dispatch(stopLoading())
			})
	}

export const customersFetchStatements = (aid) => (dispatch, getState) => {
		const filter = generateAccountFilter(getState().customers.accountFilterGeneral)

		kyteAccountStatements(aid, filter).then((res) => {
			const statements = res.data

			dispatch({ type: CUSTOMERS_FETCH_STATEMENTS, payload: statements })
		})
	}

export const customerDetailSetLoading = (status) => (dispatch) => {
	dispatch({ type: CUSTOMER_DETAIL_SET_LOADING, payload: status })
}

export const customerAccountUpdateBalance = (customerId) => (dispatch) => {
	const customer = fetchOneByID(CUSTOMER, customerId)
	dispatch({ type: CUSTOMER_ACCOUNT_UPDATE_BALANCE, payload: customer.accountBalance })
}

export const customerAccountGetStatements = (customerId, errorCb, cb) => (dispatch, getState) => {
		const { aid } = getState().auth
		dispatch({ type: CUSTOMER_DETAIL_SET_LOADING, payload: true })

		const filter = generateAccountFilter(getState().customers.accountFilter)

		kyteCustomerAccountStatements(customerId, { ...filter, aid })
			.then((res) => {
				const statements = res.data

				dispatch({ type: CUSTOMER_ACCOUNT_GET_STATEMENTS, payload: statements })
				if (cb) cb()
			})
			.catch(() => {
				if (errorCb) errorCb()
			})
	}

export const customerAccountCancelStatement = (statement, cb) => (dispatch) => {
		kyteCustomerAccountStatementsCancel(statement)
			.then((res) => {
				const customer = res.data
				dispatch({ type: CUSTOMER_DETAIL, payload: { customer: { ...customer }, detailOrigin: DetailOrigin.UPDATE } })
				dispatch({ type: CUSTOMER_ACCOUNT_CANCEL_STATEMENT })
				dispatch(customerAccountGetStatements(customer.id))
				if (cb) cb()
			})
			.catch(() => null)
	}

export const customerAccountCancelSale = (customerId, updatedCustomer) => (dispatch) => {
		dispatch(customerAccountGetStatements(customerId))
		dispatch({
			type: CUSTOMER_DETAIL,
			payload: { customer: { ...updatedCustomer }, detailOrigin: DetailOrigin.UPDATE },
		})
		dispatch({ type: COMMON_REFRESH_CUSTOMER_STATEMENTS, payload: false })
	}

export const customersGetContacts = () => (dispatch) => {
	const isPtBr = I18n.t('locale') === 'pt-br'
	dispatch(startLoading)
	Contacts.getAll((err, contacts) => {
		if (err) {
			dispatch(stopLoading())
			Alert.alert(I18n.t('words.s.attention'), I18n.t('customerImportError'))
			return
		}

		let finalContacts = []
		contacts.forEach((eachContact) => {
			// avoid duplicated contacts (Android)
			const contactMiddleName = eachContact.middleName ? `${eachContact.middleName} ` : ''
			const name = `${eachContact.givenName} ${contactMiddleName}${
				eachContact.familyName ? eachContact.familyName : ''
			}`
			const duplicated = finalContacts.find((c) => name === c.name)
			if (eachContact.givenName && !duplicated) {
				let celPhone = null
				let otherPhone = null

				eachContact.phoneNumbers.forEach((eachNumber) => {
					if (eachNumber.label === I18n.t('customerMobileLabel')) {
						celPhone = eachNumber.number
					} else if (eachNumber.label === I18n.t('customerHomeLabel')) {
						otherPhone = eachNumber.number
					}
				})

				if (!celPhone && eachContact.phoneNumbers[0] && eachContact.phoneNumbers[0].number) {
					celPhone = eachContact.phoneNumbers[0].number
				}

				if (!otherPhone && eachContact.phoneNumbers[1] && eachContact.phoneNumbers[1].number) {
					otherPhone = eachContact.phoneNumbers[1].number
				}

				finalContacts.push({
					id: eachContact.recordID,
					name,
					email: eachContact.emailAddresses.length > 0 ? eachContact.emailAddresses[0].email : null,
					celPhone:
						isPtBr && celPhone
							? celPhone
									.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
									.replace(/ /g, '')
									.substr(-11)
							: celPhone,
					phone:
						isPtBr && otherPhone
							? otherPhone
									.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
									.replace(/ /g, '')
									.substr(-11)
							: otherPhone,
					selected: false,
				})
			}
		})

		finalContacts = _.orderBy(finalContacts, ['name'], ['asc'])
		dispatch({ type: CUSTOMERS_GET_CONTACTS, payload: finalContacts })
	})
}

export const customersSelectContact = (id) => (dispatch) => {
	dispatch({
		type: CUSTOMERS_SELECT_CONTACT,
		payload: { id },
	})
}

export const customersSelectAllContacts = (type, visibleContacts) => (dispatch, getState) => {
	const {contacts} = getState().customers
	const finalContacts = []
	contacts.forEach((eachContact) => {
		if (_.includes(visibleContacts, eachContact.id)) {
			finalContacts.push({ ...eachContact, selected: type })
		} else {
			finalContacts.push(eachContact)
		}
	})
	dispatch({ type: CUSTOMERS_SELECT_ALL_CONTACTS, payload: finalContacts })
}

export const customersCleanContacts = () => (dispatch) => {
	dispatch({ type: CUSTOMERS_CLEAN_CONTACTS })
}

export const customersImportContacts = () => (dispatch, getState) => new Promise(async (resolve) => {
		const {customers} = getState()
		const stateContacts = await _.filter(customers.contacts, (eachContact) => eachContact.selected)
		const contacts = []
		await stateContacts.forEach(async (eachContact) => {
			// checking if this customer is already in the customers base using name and phone numbers
			const alreadyExists = _.find(customers.list, (eachCustomer) => (
					eachCustomer.name === eachContact.name ||
					(eachCustomer.celPhone &&
						eachContact.celPhone &&
						eachCustomer.celPhone === eachContact.celPhone.replace(/\D/g, '')) ||
					(eachCustomer.phone && eachContact.phone && eachCustomer.phone === eachContact.phone.replace(/\D/g, '')) ||
					(eachCustomer.email && eachContact.email && eachCustomer.email === eachContact.email)
				))
			if (!alreadyExists) {
				contacts.push({
					name: eachContact.name,
					celPhone: eachContact.celPhone,
					phone: eachContact.phone,
					email: eachContact.email,
					allowPayLater: false,
					accountBalance: 0,
				})
			}
		})

		insertMany(CUSTOMER, contacts)
		dispatch(customersFetch())
		resolve(contacts.length)
	})

export const customersSetAccountGeneralFilter = (value, property) => (dispatch) => {
	dispatch({ type: CUSTOMERS_ACCOUNT_GENERAL_FILTER_SET, payload: { value, property } })
}
export const customersClearAccountGeneralFilter = () => (dispatch) =>
	dispatch({ type: CUSTOMERS_ACCOUNT_GENERAL_FILTER_CLEAR })

export const customersSetAccountFilter = (value, property) => (dispatch) => {
	dispatch({ type: CUSTOMERS_ACCOUNT_FILTER_SET, payload: { value, property } })
}
export const customersClearAccountFilter = () => (dispatch) => dispatch({ type: CUSTOMERS_ACCOUNT_FILTER_CLEAR })

export const customersSetFilterTabs = (data) => (dispatch) =>
	dispatch({ type: CUSTOMERS_FILTER_TABS_SET, payload: data })

//
// Suporters
//
const generateAccountFilter = (filter) => {
	// config Filter
	const { period, days, transactionType, selectedSellers } = filter
	return {
		period: formatPeriod(period, days),
		types: xor(transactionType.debit, transactionType.credit) ? [transactionType.debit ? 'OUT' : 'IN'] : ['IN', 'OUT'],
		uids: selectedSellers.map((ss) => ss.uid),
	}
}

export const customersClear = () => ({ type: CUSTOMERS_CLEAR })
