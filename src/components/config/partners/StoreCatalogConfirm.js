import React, { Component } from 'react';
import { View, Text, Dimensions, Image, Alert } from 'react-native';
import { connect } from 'react-redux';

import { partnerIntegration } from '../../../stores/actions';
import { DetailPage, ActionButton, KyteModal, KyteIcon, LoadingCleanScreen } from '../../common';
import { scaffolding, Type, colorSet, colors } from '../../../styles';
import I18n from '../../../i18n/i18n';
import { Amway } from '../../../../assets/images';
import { checkDeviceConnection, isIphoneX } from '../../../util';
import { logEvent } from '../../../integrations';


const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;
const SMALLEST_SCREENS = SCREEN_HEIGHT <= 480;

class StoreCatalogConfirm extends Component {
  static navigationOptions = () => ({
    header: null
  });

  constructor(props) {
    super(props);
    this.state = {
      isModalVisible: false,
      company: null,
      productQuantity: 0,
      fileSize: '0MB',
    };
  }

  UNSAFE_componentWillMount() {
    const { params = {} } = this.props.route;
    if (params.code) {
      this.setState({ company: params.code, productQuantity: 92, fileSize: '5.36MB' });
    }
  }

  hideModal() {
    this.setState({ isModalVisible: false });
  }

  async partnerIntegration() {
    const { company } = this.state;
    const { displayName, email } = this.props.user;

    const getConnectionInfo = await checkDeviceConnection();
    if (!getConnectionInfo) {
      return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [{ text: 'OK' }]);
    }

    this.props.partnerIntegration(company).then(() => {
      logEvent('AmwayIntegrationSuccessful', { name: displayName, email, partner: 'amway' });
      this.setState({ isModalVisible: true });
    }).catch((error) => {
      logEvent('AmwayIntegrationError', { name: displayName, email, partner: 'amway' });
      this.setState({ isModalVisible: true });
    });
  }

  renderCompanyLogo() {
    const { company } = this.state;
    const { svgImage } = styles;
    let image;
    switch (company.trim()) {
      default: case 'amway': image = Amway; break;
    }

    return (<Image style={svgImage} source={{ uri: image }} />);
  }

  renderLoader() {
    return <LoadingCleanScreen />;
  }

  render() {
    const { bottomContainer } = scaffolding;
    const { goBack } = this.props.navigation;
    const { topContainer, infoContainer, infoStyle } = styles;
    const { visible } = this.props.loader;

    return (
      <DetailPage pageTitle={I18n.t('partnerIntegrationConfirmTitle')} goBack={goBack}>
        <View style={{ flex: 0.15, }} />
        <View style={{ flex: 1, }}>
          <View style={topContainer}>
            {this.renderCompanyLogo()}
          </View>
          <View style={[infoContainer, { flex: 0.6, justifyContent: 'flex-start' }]}>
            <Text style={[infoStyle, colorSet(colors.pimaryLighter)]}>
              {I18n.t('partnerIntegrationConfirmInfo1')} {this.state.productQuantity} {I18n.t('partnerIntegrationConfirmInfo2')}
            </Text>
          </View>
          <View style={[infoContainer, { paddingTop: SMALL_SCREENS ? 70 : 0 }]}>
            <Text style={[infoStyle, Type.Medium, Type.fontSize(17), colorSet(colors.pimaryLighter)]}>
              {I18n.t('partnerIntegrationConfirmFileSize')}:
            </Text>
            <Text style={[infoStyle, Type.Regular, Type.fontSize(19), colorSet(colors.pimaryLighter)]}>
              {this.state.fileSize}
            </Text>
          </View>
        </View>
        <View style={bottomContainer}>
          <ActionButton
            onPress={() => this.partnerIntegration()}
          >
            {I18n.t('partnerIntegrationConfirmButton')}
          </ActionButton>
        </View>
        <KyteModal
          fullPage
          fullPageTitle={I18n.t('partnerIntegrationSuccessTitle')}
          fullPageTitleIcon="back-navigation"
          height="100%"
          hideOnBack={false}
          hideFullPage={() => this.props.navigation.pop(2)}
          isModalVisible={this.state.isModalVisible}
        >
          <View style={[{ flex: 1 }, isIphoneX() ? { marginBottom: 40 } : {}]}>
            <View style={{ flex: SMALLEST_SCREENS ? 0.1 : 0.3 }} />
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <KyteIcon
                  name={'check-inner'}
                  size={Dimensions.get('window').width * 0.33}
                  color={colors.actionColor}
                />
                <Text style={[Type.fontSize(18), Type.Regular, colorSet(colors.primaryBg)]}>
                  {I18n.t('partnerIntegrationSuccessText')}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 30 }}>
                <Text style={[Type.fontSize(14), Type.Regular, colorSet(colors.primaryBg), { textAlign: 'center', lineHeight: 20 }]}>
                  {I18n.t('partnerIntegrationSuccessTextInfo')}
                </Text>
              </View>
            </View>
            <View style={bottomContainer}>
              <ActionButton
                cancel
                onPress={() => this.props.navigation.pop(2)}
              >
                {I18n.t('words.s.ok').toUpperCase()}
              </ActionButton>
            </View>
          </View>
        </KyteModal>
        {visible ? this.renderLoader() : null}
      </DetailPage>
    );
  }
}

const styles = {
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoStyle: {
    fontFamily: 'Graphik-Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  svgImage: {
    resizeMode: 'contain',
    width: SMALL_SCREENS ? Dimensions.get('window').width * 0.50 : Dimensions.get('window').width * 0.40,
    height: SMALL_SCREENS ? Dimensions.get('window').width * 0.50 : Dimensions.get('window').height * 0.40,
  }
};
const mapStateToProps = (state) => ({
  loader: state.common.loader,
  user: state.auth.user,
});

export default connect(mapStateToProps, { partnerIntegration })(StoreCatalogConfirm);
