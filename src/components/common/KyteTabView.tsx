import React from 'react'
import { Dimensions, View } from 'react-native'
import { TabView, SceneMap } from 'react-native-tab-view'
import type { Route, NavigationState } from 'react-native-tab-view'
import { LoadingCleanScreen, KyteTabBar } from './'
import { tabStyle, scaffolding } from '../../styles'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'

type TabRoute = Route & {
	title?: string
}

type ScenesConfig = Record<string, React.ComponentType<any>>

interface KyteTabViewProps {
	routes: TabRoute[]
	scenes: ScenesConfig
	lazy?: boolean
}

type KyteTabViewState = NavigationState<TabRoute>

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568
const INITIAL_LAYOUT = { width: Dimensions.get('window').width }

class KyteTabView extends React.PureComponent<KyteTabViewProps, KyteTabViewState> {
	state: KyteTabViewState = {
		index: 0,
		routes: this.props.routes,
	}

	onRequestChangeTab = (index: number) => this.setState({ index })

	renderTabs = SceneMap(this.props.scenes)

	renderHeader = (props: any) => (
      <KyteTabBar
        tabStyle={tabStyle.tab}
        indicatorStyle={tabStyle.indicator}
        style={tabStyle.base}
        labelTextStyle={tabStyle.customLabel(undefined, SMALL_SCREENS ? 11 : 13)}
        {...props}
      />	)

	render() {
		const { lazy } = this.props
		return (
			<View style={scaffolding.outerContainer}>
				<TabView
					initialLayout={INITIAL_LAYOUT}
					lazy={lazy}
					renderLazyPlaceholder={() => <LoadingCleanScreen lazy />}
					navigationState={this.state}
					renderScene={this.renderTabs}
					renderTabBar={this.renderHeader}
					onIndexChange={this.onRequestChangeTab}
				/>
			</View>
		)
	}
}

export { KyteTabView }
