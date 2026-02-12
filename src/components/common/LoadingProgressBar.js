import React, { Component } from 'react';
import { Text, Dimensions, View, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { colors, Type } from '../../styles';
import { TextButton, KyteSafeAreaView } from './';
import { setInitialRouteName } from '../../stores/actions';
import I18n from '../../i18n/i18n';

const width = Dimensions.get('window').width * 0.70;

class LoadingProgressBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      progress: new Animated.Value(0),
      timeout: props.timeout || 1500,
      displayName: this.props.displayName || '',
      description: ` ${I18n.t('words.s.loggingOut')}...`,
      textButton: I18n.t('alertDismiss'),
    };
  }

  componentDidMount() {
    Animated.timing(this.state.progress, {
      useNativeDriver: false,
      easing: Easing.inOut(Easing.linear),
      toValue: width,
      duration: this.state.timeout,
    }).start((value) => {
      if (value && value.finished) {
        this.props.setInitialRouteName('UsersLock');
      }
    });
  }

  goToBack() {
    const { navigate } = this.props.navigation;
    this.state.progress.stopAnimation((value) => {
      if (value) {
        navigate('CurrentSale');
      }
    });
  }

  renderProgressBar() {
    const { background, fill } = styles;
    const { progress } = this.state;

    return (
      <View
        style={[
          background,
          { backgroundColor: 'rgba(255, 255, 255, 0.4)', borderRadius: 2, width },
        ]}
      >
        <Animated.View style={[fill, { backgroundColor: '#ffffff', width: progress }]} />
      </View>
    );
  }

  renderButton() {
    const { textButton } = this.state;

    return (
      <TextButton
        onPress={() => this.goToBack()}
        title={textButton}
        color={colors.actionColor}
        size={18}
      />
    );
  }

  render() {
    const { textStyle, loadingContainer } = styles;
    const { description, textButton } = this.state;

    return (
      <TouchableWithoutFeedback
        style={{ flexDirection: 'row', flex: 1 }}
        onPress={() => this.goToBack()}
      >
        <KyteSafeAreaView style={loadingContainer}>
          {this.renderProgressBar()}
          <Text style={[Type.Regular, textStyle('#FFFFFF')]}>{description}</Text>
          {textButton ? this.renderButton() : null}
        </KyteSafeAreaView>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = {
  loadingContainer: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(54, 63, 77, 0.9)',
    alignItems: 'center',
    position: 'absolute',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  textStyle: (color) => ({
    color,
    marginVertical: 5,
    marginHorizontal: 20,
    paddingTop: 15,
    fontSize: 18,
    textAlign: 'center',
  }),
  background: {
    backgroundColor: '#bbbbbb',
    height: 5,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: '#3b5998',
    height: 5,
  },
};

export default connect(null, { setInitialRouteName })(LoadingProgressBar);
