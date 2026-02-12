import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Animated } from 'react-native'
import { KyteSafeAreaView } from './KyteSafeAreaView'
import { stopToast } from '../../stores/actions'
import { colors } from '../../styles'

class ToastMessage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			fadeAnim: new Animated.Value(1),
		}
	}

	componentDidMount() {
		setTimeout(() => {
			Animated.timing(this.state.fadeAnim, {
				toValue: 0,
				duration: 2000,
				useNativeDriver: true,
			}).start((value) => {
				if (value && value.finished) {
					this.props.stopToast()
				}
			})
		}, 2000)
	}

	renderContent() {
		const { toastContainer, textToast } = styles
		return (
			<View style={toastContainer}>
				<Text style={textToast}>{this.props.toast.text}</Text>
			</View>
		)
	}

	render() {
		const { fadeAnim } = this.state
		const { container } = styles

		return (
			<KyteSafeAreaView style={container}>
				<Animated.View // Special animatable View
					style={{
						...this.props.style,
						opacity: fadeAnim, // Bind opacity to animated value
					}}
				>
					{this.renderContent()}
				</Animated.View>
			</KyteSafeAreaView>
		)
	}
}

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width
const heightContainer = 120
const styles = {
	container: {
		position: 'absolute',
		left: 0,
		top: SCREEN_HEIGHT - heightContainer,
		height: heightContainer,
		width: SCREEN_WIDTH,
		justifyContent: 'center',
		alignItems: 'flex-start',
		flexDirection: 'row',
		flex: 1,
		zIndex: 21,
		paddingHorizontal: 20,
	},
	toastContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 50,
		backgroundColor: 'rgba(150, 150, 150, 0.9)',
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	textToast: {
		color: colors.white,
		fontSize: 14,
	},
}

const mapStateToProps = ({ common }) => ({
	toast: common.toast,
})

export default connect(mapStateToProps, { stopToast })(ToastMessage)
