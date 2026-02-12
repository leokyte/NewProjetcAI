import React, { Component } from 'react';
import { connect } from 'react-redux';
import { WebView } from 'react-native-webview';
import { CommonActions } from '@react-navigation/native';
import { KyteToolbar, KyteSafeAreaView } from '../common';
import LoadingScreen from '../common/LoadingScreen';
import { scaffolding } from '../../styles';
import I18n from '../../i18n/i18n';

class Helpcenter extends Component {
  static navigationOptions = () => ({
    header: null,
  });

  constructor(props) {
    super(props);
    const { params } = this.props.route;
    const renderPage = () => {
      if (params) {
        return params.page || '';
      }
      return '';
    };

    const origin = params ? params.origin || '' : '';

    this.state = {
      origin,
      page: renderPage(),
    };
  }

  componentWillUnmount() {
    const resetParams = CommonActions.setParams({
      params: { page: '' },
      key: 'Helpcenter',
    });
    this.props.navigation.dispatch(resetParams);
  }

  loadingContent() {
    return <LoadingScreen reverseColor description={I18n.t('openingScreenMessage')} />;
  }

  render() {
    const { navigate } = this.props.navigation;
    const { outerContainer } = scaffolding;

    const { auth } = this.props;
    const { billing } = this.props;

    // const isIos = Platform.OS === 'ios';

    // Script pra enviar o postMessage para a WebView:

    // window.RNPostMessage = window.postMessage;
    // window.postMessage = String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
    //
    // window.onscroll = function() {
    //   if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    //     if (${isIos}) {
    //       window.RNPostMessage("End!")
    //     } else {
    //       window.postMessage("End!")
    //     }
    //   }
    // }

    const goToBack = () => {
      const { goBack } = this.props.navigation;
      goBack();
    };

    const renderKyteToolbar = () => {
      const { origin } = this.state;
      if (origin !== 'users-lock') {
        return (
          <KyteToolbar
            borderBottom={1}
            headerTitle={I18n.t('sideMenu.helpCenter')}
            navigate={navigate}
            navigation={this.props.navigation}
            noNotification
          />
        );
      }
      return (
        <KyteToolbar
          innerPage
          borderBottom={1}
          headerTitle={I18n.t('sideMenu.helpCenter')}
          navigate={navigate}
          navigation={this.props.navigation}
          goBack={() => goToBack()}
        />
      );
    };

    const urlParams = `?email=${auth.user.email}&plan=${billing.plan}&status=${billing.status}&aid=${auth.user.aid}&uid=${auth.user.uid}`;

    let helpUrl = '';
    switch (I18n.t('locale')) {
      case 'pt-br':
        helpUrl = 'https://www.kyte.com.br/ajuda';
        break;
      case 'es':
      case 'es-ES':
        helpUrl = 'https://www.appkyte.com/ayuda';
        break;
      default:
        helpUrl = 'https://www.kyteapp.com/help';
        break;
    }

    // Métodos da WebView que escutam o postMessage:

    // onMessage={() => this.toggleChatButton(true)}
    // onNavigationStateChange={() => this.toggleChatButton(false)}

    return (
      <KyteSafeAreaView style={outerContainer}>
        {renderKyteToolbar()}
        <WebView
          renderLoading={this.loadingContent}
          startInLoadingState
          source={{ uri: `${helpUrl + urlParams}/${this.state.page}` }}
        />
      </KyteSafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  billing: state.billing,
});

export default connect(mapStateToProps)(Helpcenter);
