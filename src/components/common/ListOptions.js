import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import { KytePro, KyteBox } from '@kyteapp/kyte-ui-components'

import { KyteIcon } from "."
import { colors } from '../../styles'
import { generateTestID } from '../../util'
import { openModalWebview } from '../../stores/actions'
import ListOptionItem from './ListOptionItem'

const ListOptionsComponent = ({ billing, ...props }) => {

	const renderTip = (tip) => {
		const { onPress } = tip
		return (
			<TouchableOpacity onPress={onPress || null}>
				<KyteIcon name="help" color={colors.tipColor} />
			</TouchableOpacity>
		)
	}

	const renderItems = () => {
		const itemsArr = _.filter(props.items, (item) => !item.hideItem)

		return itemsArr.map((item, index) => (
			<View key={index}>
				{item.tip && item?.PROFeature?.isPaid && !props.isUserPro && (
					<KyteBox position="absolute" right={55} h="100%" justifyContent="center" zIndex={2}>
						{renderTip(item.tip)}
					</KyteBox>
				)}

				{item.PROFeature ? (
					<KytePro
						billing={billing}
						feature={item.PROFeature}
						component={(isFree) => <ListOptionItem item={item} index={index} isFree={isFree} {...props} />}
						onPressFree={() => {
							props.openModalWebview(item.PROFeature.infoURL)
						}}
						position={85}
					/>
				) : (
					<ListOptionItem item={item} index={index} {...props} />
				)}
			</View>
		))
	}

	return <View {...generateTestID('modal-list')}>{renderItems()}</View>
}

const customStyles = {
	itemContainer: (opacity) => ({
		opacity,
	}),
}

const mapStateToProps = ({ billing }) => ({
	billing,
})

const ListOptions = connect(mapStateToProps, { openModalWebview })(ListOptionsComponent)
export { ListOptions }
