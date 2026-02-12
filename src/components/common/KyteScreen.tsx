import React from 'react'
import { Platform } from 'react-native'
import { Container } from '@kyteapp/kyte-ui-components'
import { colors } from '../../styles'
import { KyteToolbar, KyteSafeAreaView, CustomKeyboardAvoidingView } from './index'
import { TabletScreenContainer } from './scaffolding/TabletScreenContainer'

interface KyteScreenProps {
	children: React.ReactNode
	navigation: any
	title: string
	maxHeight?: number
	backgroundColor?: string
	rightButtons?: any[]
	hideHeader?: boolean
	headerProps?: any
	containerProps?: any
	contentContainerProps?: any
}

/**
 * Base component for creating screens following the Kyte project pattern
 *
 * @param children - Screen content
 * @param navigation - React Navigation object
 * @param title - Screen title
 * @param maxHeight - Maximum container height (default: 620)
 * @param backgroundColor - Content background color (default: colors.lightBg)
 * @param rightButtons - Header buttons (optional)
 * @param hideHeader - If true, hides the header (default: false)
 * @param headerProps - Additional props for KyteToolbar
 * @param containerProps - Additional props for main Container
 * @param contentContainerProps - Additional props for content Container
 */
const KyteScreen: React.FC<KyteScreenProps> = ({
	children,
	navigation,
	title,
	maxHeight = 620,
	backgroundColor = colors.lightBg,
	rightButtons,
	hideHeader = false,
	headerProps = {},
	containerProps = {},
	contentContainerProps = {},
}) => {
	const containerBackground = {
		...Platform.select({
			ios: { backgroundColor: '#FFFFFF' },
			android: { backgroundColor: 'transparent' },
		}),
	}

	const renderHeader = () => {
		if (hideHeader) return null

		return (
			<KyteToolbar
				headerTitle={title}
				navigation={navigation}
				borderBottom={0}
				rightButtons={rightButtons}
				{...headerProps}
				{...({} as any)}
			/>
		)
	}

	const renderContent = () => (
		<CustomKeyboardAvoidingView style={{ flex: 1 }}>
			<Container
				flex={1}
				paddingHorizontal={20}
				paddingVertical={20}
				backgroundColor={backgroundColor}
				{...contentContainerProps}
			>
				{children}
			</Container>
		</CustomKeyboardAvoidingView>
	)

	return (
		<TabletScreenContainer maxHeight={maxHeight}>
			<KyteSafeAreaView
				style={{
					...containerBackground,
					flex: 1,
				}}
			>
				{renderHeader()}
				{renderContent()}
			</KyteSafeAreaView>
		</TabletScreenContainer>
	)
}

export default KyteScreen
