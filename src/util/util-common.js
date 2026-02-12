import { Alert, Platform, Text, Dimensions } from 'react-native'
import React from 'react'
import { MaskService } from 'react-native-masked-text'
import DeviceInfo from 'react-native-device-info'
import _ from 'lodash'
import isValidCnpj from '@brazilian-utils/is-valid-cnpj'
import isValidCpf from '@brazilian-utils/is-valid-cpf'
import formatCpf from '@brazilian-utils/format-cpf'
import formatCnpj from '@brazilian-utils/format-cnpj'
import Contacts from 'react-native-contacts'
import NetInfo from '@react-native-community/netinfo'
import * as RNLocalize from 'react-native-localize'

import I18n from '../i18n/i18n'
import { CONTACTS, UserPermission } from '../enums'
import { requestPermission } from './util-permissions'

export const isAndroid = Platform.OS === 'android'

export const screenDm = {
	WIDTH: Dimensions.get('window').width,
	HEIGHT: Dimensions.get('window').height,
}

export const xor = (p, q) => !((p && q) || (!p && !q))

// swap position of and element in array
export const swapPosition = (array, oldPos, newPos) => {
	const element = array[oldPos]
	// remove El
	array.splice(oldPos, 1)

	// insert element
	array.splice(newPos, 0, element)

	return array
}

let lastClickDate = new Date('1999')
export const avoidDoubleClick = (func) => {
	const clickDate = new Date()
	if (clickDate.getTime() < lastClickDate.getTime() + 2000) return

	lastClickDate = clickDate
	func()
}

const maskServiceOptions = (precision = 2) => ({
	delimiter: ' ',
	unit: '',
	separator: '.',
	precision,
})

// Mask Text / Number
export const formatStockFractioned = (value, decimalSeparator = ',', groupingSeparator = '.') => {
	const number = MaskService.toMask('money', Number(value), {
		unit: '',
		separator: decimalSeparator,
		delimiter: groupingSeparator,
		precision: 3,
	})

	return value < 0 ? `-${number}` : number
}

// This method was added just to prevent possible errors in other parts in the app
export const formatCurrencyStatistics = (info, currency, decimalCurrency) => {
	const { currencySymbol, decimalSeparator, groupingSeparator } = currency
	return `${currencySymbol} ${formatNoDecimalValue(info, currency)}`
}

// Decimal Currency
export const currencyFormat = (info, currency, decimalCurrency, useValueSymbol = false) => {
	const { currencySymbol, decimalSeparator, groupingSeparator } = currency
	if (decimalCurrency) {
		let formattedValue = MaskService.toMask('money', info.toFixed(2), {
			unit: `${currencySymbol} `,
			separator: decimalSeparator,
			delimiter: groupingSeparator,
		})
		if (useValueSymbol) {
			const valueSymbol = info.toString().match(/(?:(?:\+))|(?:(?:\-))/)
			if (valueSymbol) {
				formattedValue = `${valueSymbol[0]}${formattedValue}`
			}
		}
		return formattedValue
	}
	return `${currencySymbol} ${formatNoDecimalValue(info, currency)}`
}

// Format values for NO decimal part. 'currencyFormat' AUX
export const formatNoDecimalValue = (value, currency) => {
	const groupingSeparator = currency.groupingSeparator || '.'
	const decimalSeparator = currency.decimalSeparator || ','
	const checkDecimalValues = (decimalPart) => {
		if (decimalPart.match(/00/)) return ''
		if (decimalPart.match(/.0/)) return decimalPart[0]
		return decimalPart
	}

	value = value
		? parseFloat(value)
				.toFixed(2)
				.replace(/\d(?=(\d{3})+\.)/g, '$&,')
		: (0.0).toFixed(2)
	const splittedValue = value.split('.')
	const decimalPart = checkDecimalValues(splittedValue[1])
	const integerPart = splittedValue[0].replace(/,/g, groupingSeparator)

	if (decimalPart) return `${integerPart}${decimalSeparator}${decimalPart}`
	return integerPart
}

// calculator
export const incrementNumberToValue = (value, number, type, precision) => {
	if (type === 'decimal') {
		return incrementNumberToDecimalValue(value, number, precision)
	}

	return value ? `${value}${number}` : number
}

const incrementNumberToDecimalValue = (value, number, precision) => {
	if (parseFloat(value) === 0 && number === 0) {
		return '0'
	}

	let valueStripped = `${value}`

	if (value.length < 11) {
		valueStripped = `${value}${number}`
	}

	valueStripped = MaskService.toMask('money', valueStripped, maskServiceOptions(precision)).replace(/\s/g, '')
	return valueStripped
}

export const decrementNumberToValue = (value, type, precision) => {
	if (type === 'decimal') {
		return decrementNumberToDecimalValue(value, precision)
	}

	return value ? value.toString().slice(0, -1) : value
}

const decrementNumberToDecimalValue = (value, precision) => {
	const valueStripped = value.toString().replace('.', '')
	const newValue = valueStripped.toString().length === 1 ? '0' : valueStripped.toString().slice(0, -1)
	return MaskService.toMask('money', newValue, maskServiceOptions(precision)).replace(/\s/g, '');
}

export const convertMoneyToDecimal = (value, currencySymbol) =>
	+parseFloat(convertMoneyToDecimalFixed(value, currencySymbol))

export const convertPrice = (value) => MaskService.toMask('money', value, maskServiceOptions()).replace(/\s/g, '')

export const convertMoneyToDecimalFixed = (value, currencySymbol) => {
	const strValue =
		value.toString().indexOf(currencySymbol) === -1
			? parseFloat(value)
			: parseFloat(MaskService.toMask('money', value, maskServiceOptions()).replace(/\s/g, ''))
	return strValue.toFixed(2)
}

export const convertOnlyToNumber = (value) => value.replace(/[^0-9]+/g, '')

// Calcule
export const calculeValuePercent = (totalValue, percent) => parseFloat((totalValue * percent) / 100)

export const calculePercent = (totalValue, value) => (totalValue <= 0 ? 0 : parseFloat((value * 100) / totalValue))

export const listIndex = (length) => {
	let range = 1
	let qtyBlocks = 1
	const array = []
	let indexStart = 0
	const indexEnd = length - 1

	const calcRange = (subtract = 0) => parseInt(((length + subtract) / qtyBlocks).toFixed(0))

	const arrForFiveKeys = () => {
		const arr = []
		for (let index = 0; index < 20; index++) {
			arr.push(5 + index * 4)
		}
		return arr
	}

	if (arrForFiveKeys().indexOf(length) >= 0) {
		qtyBlocks = 4
		range = calcRange()
	} else if (length > 3 && length !== 6) {
		if (length % 2 === 0) {
			qtyBlocks = 3
			range = calcRange(-1)
		} else {
			qtyBlocks = 2
			range = calcRange(-1)
		}
	} else {
		qtyBlocks = length - 1
	}

	for (let i = 0; i <= qtyBlocks; i++) {
		if (i === 0) {
			array.push(indexStart)
		} else if (i === qtyBlocks) {
			array.push(indexEnd)
		} else if (length % 2 === 0 && length > 6) {
			array.push(indexStart + range)
			i++
			array.push(indexEnd - range)
		} else {
			indexStart += range
			array.push(indexStart)
		}
	}

	return _.sortBy(array, (item) => item)
}

// Alert
export const showAlert = (title, description, actions) => {
	Alert.alert(title, description, actions)
}

export const showOfflineAlert = () => {
	Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }])
}

export const isIphoneXOldMethod = async (checkXonly) => {
	const bigIphones = ['iPhone10,3', 'iPhone10,6', 'iPhone11,8', 'iPhone11,2', 'iPhone11,4', 'iPhone11,8']

	const deviceId = DeviceInfo.getDeviceId()
	if (checkXonly) {
		return (
			deviceId === 'iPhone10,6' ||
			deviceId === 'iPhone10,3' ||
			deviceId === 'iPhone11,2' ||
			deviceId === 'iPhone11,4' ||
			deviceId === 'iPhone11,8'
		)
	}
	const isBig = _.find(bigIphones, (item) => item === deviceId)
	return !!isBig
}

export const isIpad = () => {
	const ipadModels = [
		'iPad1,1',
		'iPad1,2',
		'iPad2,1',
		'iPad2,2',
		'iPad2,3',
		'iPad2,4',
		'iPad3,1',
		'iPad3,2',
		'iPad3,3',
		'iPad2,5',
		'iPad2,6',
		'iPad2,7',
		'iPad3,4',
		'iPad3,5',
		'iPad3,6',
		'iPad4,1',
		'iPad4,2',
		'iPad4,3',
		'iPad4,4',
		'iPad4,5',
		'iPad4,6',
		'iPad4,7',
		'iPad4,8',
		'iPad4,9',
		'iPad5,1',
		'iPad5,2',
		'iPad5,3',
		'iPad5,4',
		'iPad6,3',
		'iPad6,4',
		'iPad6,7',
		'iPad6,8',
		'iPad6,11',
		'iPad6,12',
		'iPad7,1',
		'iPad7,2',
		'iPad7,3',
		'iPad7,4',
		'iPad7,5',
		'iPad7,6',
		'iPad8,1',
		'iPad8,2',
		'iPad8,3',
		'iPad8,4',
		'iPad8,5',
		'iPad8,6',
		'iPad8,7',
		'iPad8,8',
		'iPad8,9',
		'iPad8,10',
		'iPad8,11',
		'iPad8,12',
		'iPad11,1',
		'iPad11,2',
		'iPad11,3',
		'iPad11,4',
	]

	const deviceId = DeviceInfo.getDeviceId()
	const isIpad = _.find(ipadModels, (item) => item === deviceId)
	return !!isIpad
}

export const isIphoneX = () => {
	// This has to be iOS
	if (Platform.OS === 'ios') {
		const hasNotchOrDynamicIsland = DeviceInfo.hasNotch() || DeviceInfo.hasDynamicIsland()
		return hasNotchOrDynamicIsland
	}
	return false
}

export const checkIfReachedLimit = (registers, permissions) => {
	const totalRegisters = registers.totalSale + registers.totalProduct + registers.totalCustomer
	const isAdmin = permissions.isAdmin || permissions.isOwner

	if (totalRegisters >= 10) {
		return isAdmin ? 'Confirmation' : 'Confirmation'
	}

	return false
}

export const checkUserPermission = (permissions) => {
	const allowPrivateDevice = permissions.allowPrivateDevice || permissions.isAdmin || permissions.isOwner || false
	const allowProductsRegister = permissions.allowProductsRegister || permissions.isAdmin || permissions.isOwner || false
	const allowSalesDiscount = permissions.allowSalesDiscount || permissions.isAdmin || permissions.isOwner || false
	const allowViewOtherSales = permissions.allowViewOtherSales || permissions.isAdmin || permissions.isOwner || false
	const allowStockManager = permissions.allowStockManager || permissions.isAdmin || permissions.isOwner || false
	const allowCustomerInDebt = permissions.allowCustomerInDebt || permissions.isAdmin || permissions.isOwner || false
	const isAdmin = permissions.isAdmin || permissions.isOwner || false
	const isOwner = permissions.isOwner || false

	return {
		allowPrivateDevice,
		allowProductsRegister,
		allowSalesDiscount,
		allowViewOtherSales,
		allowStockManager,
		allowCustomerInDebt,
		isAdmin,
		isOwner,
	}
}

export const checkUserPermissionWithType = (permissions) => {
	const getPermissions = checkUserPermission(permissions)
	return [
		{ value: getPermissions.isAdmin, type: UserPermission.ADMIN },
		{ value: getPermissions.allowPrivateDevice, type: UserPermission.PERSONAL_PHONE },
		{ value: getPermissions.allowViewOtherSales, type: UserPermission.SEE_ALL_SALES },
		{ value: getPermissions.allowSalesDiscount, type: UserPermission.GIVE_DISCOUNT },
		{ value: getPermissions.allowProductsRegister, type: UserPermission.MANAGE_PRODUCTS },
		{ value: getPermissions.allowStockManager, type: UserPermission.MANAGE_STOCK },
		{ value: getPermissions.allowCustomerInDebt, type: UserPermission.ALLOW_CUSTOMER_IN_DEBT },
	]
}

/**
 * Check internet connection of the current device
 * @returns true -> internet connection OK
 * @returns false -> internet connection NOT OK
 */
export const checkDeviceConnection = async () => {
	const getConnectionInfo = await NetInfo.fetch().then((state) => (state.isConnected ? state.isConnected : false))

	return getConnectionInfo
}

// Capitalize first letter of all words
export const capitalizeFirstLetter = (words) =>
	!words ? words : words.replace(/(^|\s)\S/g, (match) => match.toUpperCase())

// Capitalize only the first letter of string
export const capitalizeFirstLetterOfString = (words) =>
	!words ? words : words.charAt(0).toUpperCase() + words.slice(1)

export const decodeURLParams = (search) => {
	search = search.replace(/\%26/g, '&')
	const hasHashes = search.indexOf('?') > 0
	if (!hasHashes) return
	const hashes = search.slice(search.indexOf('?') + 1).split('&')
	return hashes.reduce((params, hash) => {
		const split = hash.indexOf('=')
		const key = hash.slice(0, split)
		const val = hash.slice(split + 1)
		return Object.assign(params, { [key]: decodeURIComponent(val) })
	}, {})
}

export const decodeParamsIntoObject = (params) => {
	if (!params) return {}

	const obj = {}
	try {
		params.split('&').forEach((item) => {
			const [key, value] = item.split('=')
			obj[key] = value
		})
	} catch (error) {
		console.warn('Error on decodeParamsIntoObject', error)
	}
	return obj
}

export const separateCamelCaseLettersWithUnderscore = (string) =>
	string.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()

export const turnObjectPropertiesIntoString = (props) => {
	const newProps = {}
	Object.keys(props).forEach((key) => {
		newProps[key] = props?.[key]?.toString() || ''
	})
	return newProps
}

export const turnObjectKeysIntoString = (obj) => {
	const newObj = {}
	Object.keys(obj).forEach((key) => {
		newObj[separateCamelCaseLettersWithUnderscore(key)] = obj[key]
	})
	return newObj
}

export const validateCpfOrCpnj = (value) => {
	const formattedValue = value.toString().replace(/[^0-9]/g, '')
	return formattedValue.length === 11 ? isValidCpf(formattedValue) : isValidCnpj(formattedValue)
}

export const formatCpfOrCnpj = (value) => {
	const formattedValue = value.toString().replace(/[^0-9]/g, '')
	return formattedValue.length === 11 ? formatCpf(formattedValue) : formatCnpj(formattedValue)
}

export const formatPhoneBR = (value) =>
	MaskService.toMask('custom', value, {
		mask: '+55 (99) 99999-999999999999999999',
	})

export const removeAccents = (string) => {
	const accents = 'ÀÁÂÃÄÅĄàáâãäåąßÒÓÔÕÕÖØÓòóôõöøóÈÉÊËĘèéêëęðÇĆçćÐÌÍÎÏìíîïÙÚÛÜùúûüÑŃñńŠŚšśŸÿýŽŻŹžżź'
	const accentsOut = 'AAAAAAAaaaaaaaBOOOOOOOOoooooooEEEEEeeeeeeCCccDIIIIiiiiUUUUuuuuNNnnSSssYyyZZZzzz'
	return string
		.split('')
		.map((letter, index) => {
			const accentIndex = accents.indexOf(letter)
			return accentIndex !== -1 ? accentsOut[accentIndex] : letter
		})
		.join('')
}

export const isDecimal = (num) => num % 1 !== 0

export const insertContactInContactsList = async (customer) => {
	const phones = []
	const emails = []
	const customerEmail = customer.email ? emails.push({ label: 'personal', email: customer.email }) : {}
	const celPhone = customer.celPhone
		? phones.push({ label: I18n.t('customerMobileLabel'), number: customer.celPhone })
		: {}
	const phone = customer.phone ? phones.push({ label: I18n.t('customerHomeLabel'), number: customer.phone }) : {}

	let newContact = { givenName: removeAccents(customer.name) }
	if (customerEmail) {
		newContact = { ...newContact, emailAddresses: emails }
	}
	if (phones.length > 0) {
		newContact = { ...newContact, phoneNumbers: phones }
	}

	const hasPermission = await requestPermission(CONTACTS)
	hasPermission &&
		Contacts.addContact(newContact, (err) => {
			if (err) Alert.alert(I18n.t('words.s.attention'), I18n.t('customerInsertContactError'))
		})
}

export const applyBoldStyle = (textSource, boldText) => {
	let numberOfItemsAdded = 0
	const result = textSource.split(/\{\d+\}/)
	boldText.forEach((t, i) =>
		result.splice(
			++numberOfItemsAdded + i,
			0,
			<Text key={i} style={{ fontWeight: 'bold' }}>
				{t}
			</Text>
		)
	)
	return <Text>{result}</Text>
}

export const slugify = (text) => {
	const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
	const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
	const p = new RegExp(a.split('').join('|'), 'g')

	return text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
		.replace(/&/g, '-and-') // Replace & with 'and'
		.replace(/[^\w\-]+/g, '') // Remove all non-word characters
		.replace(/\-\-+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
}

// Check if user is in BraSil
export const checkIsBr = () => RNLocalize.getCountry() === 'BR'

export const isEqual = (obj1, obj2) => _.isEqual(obj1, obj2)

export const NEW_CATALOG_VERSION = 3

// Extract aand normalized device userAgent
export const getNormalizedUserAgent = async () => {
	const userAgent = await DeviceInfo.getUserAgent()
	const extractFirstParenthesesContent = (str) => {
		const match = str?.match(/\(([^)]+)\)/)
		return match ? match[1] : ''
	}
	const extractedUserAgent = extractFirstParenthesesContent(userAgent)
	const normalizedUserAgent = extractedUserAgent?.toLowerCase()?.replace(/ /g, '-')

	// normalizedUserAgent: 'iphone;-cpu-iphone-os-15_0-like-mac-os-x'
	return normalizedUserAgent
}

// Gets users platform, screen size and language to build a unique fingerprint
export const getUserFingerPrint = () => {
	const languageCode = RNLocalize.getLocales()[0]?.languageCode
	const width = parseFloat(screenDm.WIDTH).toFixed(0)
	const height = parseFloat(screenDm.HEIGHT).toFixed(0)
	const isiOS = Platform.OS === 'ios'
	const fingerprint = `${Platform.OS}-${width}${isiOS ? `-${height}` : ''}-${languageCode}`.toLowerCase()

	// Returns a string with the following format:
	// 'ios-375-812-en'
	return fingerprint
}

export const getIsBRAndUseBRL = (currency) => currency?.countryCode === 'BR' || checkIsBr()
