import React, { memo, useCallback } from 'react'
import { BundleEnum, KYTE_CONTROL_APP_ID } from '../../../../../enums'
import i18n, { getLocale } from '../../../../../i18n/i18n'
import { KYTE_CONTROL_APP_URL } from '../../../../../kyte-constants'
import { openAppUrl } from '../../../../../util/util-url-friendly'
import TooltipContainer from '../../../../common/utilities/TooltipContainer'

const Strings = {
	t_title: i18n.t('deadlineAndFees.help.title'),
	t_description: i18n.t('deadlineAndFees.help.description'),
	t_btn_kyte_control: i18n.t('deadlineAndFees.help.button'),
}
function CardServiceConfigTooltip() {
	const onPressKyteControlBtn = useCallback(() => {
		const locale = getLocale()

		openAppUrl(KYTE_CONTROL_APP_URL, {
			locale,
			playStoreId: BundleEnum.CONTROL_ANDROID,
			appStoreId: KYTE_CONTROL_APP_ID,
		})
	}, [])

	return (
		<TooltipContainer
			leftIcon="cell-phone"
			terms={{ title: Strings.t_title, description: [Strings.t_description] }}
			help={{ onPress: onPressKyteControlBtn, leftIcon: 'nav-arrow-right', text: Strings.t_btn_kyte_control }}
		/>
	)
}

export default memo(CardServiceConfigTooltip)
