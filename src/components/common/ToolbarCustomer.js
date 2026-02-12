import React from 'react'
import { Alert } from 'react-native'
import { connect } from 'react-redux'
import _ from 'lodash'
import { generateTestID } from '../../util'
import { Tag } from '.'
import { colors } from '../../styles'
import I18n from '../../i18n/i18n'

const Strings = {
	noCustomerMessage: I18n.t('noCustomerMessage'),
}
const TC = ({ customer, navigation, inDetail, onPress, params }) => {
	const handleOnPress = () => {
		if (!customer) return Alert.alert(I18n.t('words.s.attention'), Strings.noCustomerMessage)
		if (inDetail) return onPress()
		navigation.navigate({ key: 'CustomerAddPage', name: 'CustomerAdd', params })
	}

	return (
		<Tag
			style={{ marginRight: 10 }}
			info={_.map(customer?.name?.split(' '), _.upperFirst).join(' ')}
			color={
				customer?.accountBalance < 0
					? colors.errorColor
					: customer?.accountBalance > 0
					? colors.actionColor
					: colors.primaryColor
			}
			icon="customer"
			onPress={() => handleOnPress()}
			testProps={generateTestID('added-cus')}
		/>
	)
}

const ToolbarCustomer = connect(null)(TC)

export { ToolbarCustomer }
