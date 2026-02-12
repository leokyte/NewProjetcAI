import { useEffect } from 'react'
import { connect } from 'react-redux'

import { redirectCheckoutWeb } from '../../stores/actions'

export const RedirectCheckoutWebComponent = ({ ...props }) => {
	useEffect(() => {
		props.redirectCheckoutWeb()
	}, [])

	return null
}

const RedirectCheckoutWeb = connect(null, { redirectCheckoutWeb })(RedirectCheckoutWebComponent)
export { RedirectCheckoutWeb }
