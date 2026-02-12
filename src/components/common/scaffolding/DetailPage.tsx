import React, { ComponentProps, ReactNode } from 'react'
import { KyteToolbar, KyteSafeAreaView } from '..'
import { scaffolding } from '../../../styles'
import { StyleProp, ViewStyle } from 'react-native'
import { NavigationProp } from '@react-navigation/native'

type KyteToolbarProps = ComponentProps<typeof KyteToolbar> & {
	navigate: any
	goBackTestProps: any
}

export interface DetailPageProps {
	// Style props
	style?: StyleProp<ViewStyle>
	headerStyle?: StyleProp<ViewStyle>

	// Header visibility and styling
	hideHeader?: boolean
	noHeaderBorder?: boolean
	outerPage?: boolean

	// Header content
	pageTitle?: string
	rightComponent?: ReactNode
	rightButtons?: {
		icon?: string
		onPress?: () => void
		testProps?: any
		color?: string
		iconSize?: number
		isHidden?: boolean
	}[]
	rightText?: string
	useCommonIcon?: boolean
	showCloseButton?: boolean

	// Navigation props
	goBack?: () => void
	navigate?: NavigationProp<any>['navigate']
	navigation?: NavigationProp<any>

	// Testing props
	goBackTestProps?: {
		testID?: string
		accessibilityLabel?: string
	}

	// Additional props
	toolbarProps?: Partial<KyteToolbarProps>
	children?: ReactNode
	isSearchVisible?: boolean
}

const DetailPage: React.FC<DetailPageProps> = (props) => (
	<KyteSafeAreaView style={[scaffolding.outerContainer, props.style]}>
		{!props.hideHeader ? (
			<KyteToolbar
				innerPage={!props.outerPage}
				borderBottom={props.noHeaderBorder ? 0 : 1.5}
				headerTitle={props.pageTitle}
				goBack={() => props.goBack?.()}
				navigate={props.navigate as any}
				navigation={props.navigation}
				rightComponent={props.rightComponent}
				rightButtons={props.rightButtons}
				useCommonIcon={props.useCommonIcon}
				showCloseButton={props.showCloseButton}
				rightText={props.rightText}
				style={props.headerStyle}
				goBackTestProps={props.goBackTestProps}
				isSearchVisible={props.isSearchVisible ?? false}
				{...props.toolbarProps}
				{...({} as any)}
			/>
		) : null}
		{props.children}
	</KyteSafeAreaView>
)

export { DetailPage }
