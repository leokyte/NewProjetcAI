import React from 'react'
import { FlatList, Text, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import { KyteBox } from '@kyteapp/kyte-ui-components'

import { KyteListItem } from './KyteListItem'
import { colors, Type, colorSet } from '../../styles'

export const KyteList = ({ type, onItemPress, disabled, onPress, data, testProps, refreshControl, ...props }) => {
	const renderItem = ({ item, index }) => {
		const renderChecked = () => {
			return (
				<KyteBox justify="center" alignItems="flex-end">
					<Icon name="check" size={20} color={colors.actionColor} />
				</KyteBox>
			)
		}

		switch (type) {
			case 'printerOptions':
				return (
					<TouchableOpacity onPress={disabled ? null : () => onPress(item)} style={styles.printerOptionsButton}>
						<KyteBox grow={1} justify="center">
							<Text style={[Type.Regular, Type.fontSize(13), colorSet(colors.secondaryBg)]}>{item.name}</Text>
						</KyteBox>
						{item.selected && renderChecked()}
					</TouchableOpacity>
				)
			default:
				return (
					<KyteListItem
						title={item.title}
						subtitle={item.subtitle}
						leftContent={item.leftContent}
						rightContent={item.rightContent}
						rightContentStyle={item.rightContentStyle}
						onItemPress={() => onItemPress(item)}
						lastItem={index === data.length - 1}
						active={item.active}
						hideChevron={item.hideChevron}
						customComponent={item.customComponent}
						badgeColor={item.badgeColor}
					/>
				)
		}
	}

	const renderSeparator = () => <KyteBox borderBottomWidth={1} borderBottomColor={colors.borderlight} />

	return (
		<FlatList
			data={data}
			renderItem={renderItem}
			keyExtractor={(_, index) => index.toString()}
			ItemSeparatorComponent={renderSeparator}
			{...props}
			{...testProps}
		/>
	)
}

const styles = {
	printerOptionsButton: {
		flex: 1,
		flexDirection: 'row',
		paddingHorizontal: 20,
		paddingVertical: 17,
	},
	disabled: { opacity: 0.5 },
}
