import React, { useEffect, useState } from 'react'
import { KyteText, colors, KyteBox, KyteIcon } from '@kyteapp/kyte-ui-components'

import I18n from '../../../i18n/i18n'

const SalesFetchErrorMessage = ({ showWarning }) => {
	const [modalVisible, setModalVisible] = useState(showWarning)

	useEffect(() => {
		if (showWarning)
			setTimeout(() => {
				setModalVisible(false)
			}, 5000)
		else setModalVisible(false)
	}, [showWarning])

	return (
		modalVisible && (
			<KyteBox position="absolute" bottom={10} zIndex={1} justify="center" align="center" d="row" left={20} right={20}>
				<KyteBox bg={colors.gray02Kyte} p={2} br={4} d="row" align="center">
					<KyteBox mr={4}>
						<KyteIcon size={33} name="swipe-down" color="#FFFFFF" />
					</KyteBox>
					<KyteBox maxWidth={230}>
						<KyteText textAlign="center" lineHeight={20} size={12} color="white" weight={500}>
							{I18n.t('SalesFetchErrorMessage.text1')}
						</KyteText>
						<KyteText textAlign="center" lineHeight={20} size={12} color="white" weight={500}>
							{I18n.t('SalesFetchErrorMessage.text2')}
						</KyteText>
					</KyteBox>
				</KyteBox>
			</KyteBox>
		)
	)
}

export default SalesFetchErrorMessage
