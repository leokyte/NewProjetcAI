import React from 'react'
import { Platform, View, Text, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import _ from 'lodash'
import { SubHeaderButton, KyteIcon, Input } from '.'
import { colors, scaffolding, Type, colorSet } from '../../styles'
import { generateTestID } from '../../util'

const SearchBar = (props) => {
	const { searchBarContainer, subBarDefaults, searchBar } = scaffolding

	const renderClosedSearchBar = () => {
		const renderPlusButton = () => {
			return (
				<View>
					<SubHeaderButton onPress={() => props.plusAction()} {...props.plusBtnProps}>
						<KyteIcon name="plus-calculator" color={colors.actionColor} {...generateTestID('add-prod-categ')} />
					</SubHeaderButton>
				</View>
			)
		}
		const renderFilterButton = () => {
			return (
				<View>
					<SubHeaderButton onPress={() => props.filterAction()}>
						<KyteIcon name="filter" color={props.filterActive ? colors.actionColor : colors.secondaryBg} />
					</SubHeaderButton>
				</View>
			)
		}

		return (
			<View
				style={[
					searchBarContainer,
					subBarDefaults,
					styles.searchBarList,
					props.style,
					Platform.select({
						ios: { paddingVertical: 20, paddingBottom: 15 },
						android: { paddingVertical: 0 },
					}),
				]}
			>
				<TouchableOpacity
					disabled={props.disabled}
					activeOpacity={0.8}
					style={{ flex: 2 }}
					onPress={() => props.toggleSearch()}
					{...generateTestID(props.testID || 'search-bar')}
				>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<SubHeaderButton disabled={props.disabled} onPress={() => props.toggleSearch()}>
							<KyteIcon name="search" color={colors.secondaryBg} />
						</SubHeaderButton>
						<Text
							style={[
								Type.Regular,
								Type.fontSize(14),
								colorSet(colors.disabledColor),
								Platform.select({ ios: { paddingTop: 2 }, android: { paddingTop: 0 } }),
							]}
						>
							{props.closedPlaceholder}
						</Text>
					</View>
				</TouchableOpacity>
				{props.plusAction ? renderPlusButton() : null}
				{props.filterAction ? renderFilterButton() : null}
				{props.rightButton ? props.rightButton() : null}
			</View>
		)
	}

	const renderOpenedSearchBar = () => {
		return (
			<View
				style={[
					searchBarContainer,
					subBarDefaults,
					styles.searchBarList,
					props.style,
					Platform.select({
						ios: { paddingVertical: 20, paddingBottom: 15 },
						android: { paddingBottom: 0 },
					}),
				]}
			>
				<SubHeaderButton onPress={() => props.closeSearchAction()} testProps={generateTestID('close-search-nck')}>
					<Icon name="close" color={colors.primaryColor} />
				</SubHeaderButton>
				<Input
					disabled={props.disabled}
					onChangeText={_.debounce((text) => props.searchAction(text), 800)}
					onEndEditing={props.onEndSearch}
					style={[
						searchBar,
						Platform.select({
							ios: { paddingBottom: 0, paddingLeft: 0, fontSize: 14 },
							android: { paddingLeft: 0, fontSize: 14 },
						}),
					]}
					placeholder={props.openedPlaceholder}
					flex
					noBorder
					autoFocus={!props.value}
					hideLabel
					autoCorrect
				/>
			</View>
		)
	}

	return props.isOpened || props.value ? renderOpenedSearchBar() : renderClosedSearchBar()
}

const styles = {
	searchBarList: {
		paddingLeft: 0,
	},
	inputStyle: {
		color: colors.secondaryBg,
		fontFamily: 'Graphik-Regular',
	},
}

export { SearchBar }
