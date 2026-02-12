import React, { useCallback } from 'react'
import { View, Text, Dimensions, StyleProp, TextStyle, ViewStyle } from 'react-native'
import { TabBar, TabBarItem } from 'react-native-tab-view'
import type { Route, TabBarProps, TabBarItemProps, TabDescriptor } from 'react-native-tab-view'
import { tabStyle, colors } from '../../styles'

type LabelRendererProps<T extends Route> = Parameters<NonNullable<TabDescriptor<T>['label']>>[0]

interface KyteTabBarProps<T extends Route> extends TabBarProps<T> {
	labelTextStyle?: StyleProp<TextStyle>
	labelContainerStyle?: StyleProp<ViewStyle>
	renderLabel?: (props: LabelRendererProps<T>) => React.ReactNode
}

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

function KyteTabBar<T extends Route>({
	labelTextStyle,
	labelContainerStyle,
	renderLabel,
	tabStyle: tabStyleOverride,
	indicatorStyle,
	style,
	activeColor,
	inactiveColor,
	...rest
}: KyteTabBarProps<T>) {
	const renderLabelContent = useCallback(
		(labelProps: LabelRendererProps<T>) => {
			const labelText = labelProps.labelText ?? labelProps.route?.title ?? ''
			const safeLabelProps = { ...labelProps, labelText }

			if (renderLabel) return renderLabel(safeLabelProps)

			const fallbackColor = labelProps.focused ? colors.actionColor : colors.primaryColor
			const finalColor = labelProps.color || fallbackColor
			const title = safeLabelProps.labelText

			return (
				<View style={[tabStyle.labelContainer as StyleProp<ViewStyle>, labelContainerStyle]}>
					<Text numberOfLines={1} style={[tabStyle.customLabel(finalColor, SMALL_SCREENS ? 11 : 13), labelTextStyle, { color: finalColor }]}>{title}</Text>
				</View>
			)
		},
		[labelContainerStyle, labelTextStyle, renderLabel]
	)

	const renderTabItem = useCallback(
		({ key, ...props }: TabBarItemProps<T> & { key: string }) => {
			const fallbackLabelText = props.labelText ?? props.route?.title ?? ''
			const safeProps = { ...props, labelText: fallbackLabelText }
			return <TabBarItem key={key} {...safeProps} label={(labelProps) => renderLabelContent(labelProps)} />
		},
		[renderLabelContent]
	)

	return (
		<TabBar
			tabStyle={tabStyleOverride ?? tabStyle.tab}
			indicatorStyle={indicatorStyle ?? tabStyle.indicator}
			style={style ?? tabStyle.base}
			activeColor={activeColor ?? colors.actionColor}
			inactiveColor={inactiveColor ?? colors.primaryColor}
			renderTabBarItem={renderTabItem}
			{...rest}
		/>
	)
}

export { KyteTabBar }
