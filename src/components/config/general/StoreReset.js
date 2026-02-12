import React, { Component } from 'react';
import { View, Text, Alert, Image, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CheckBox } from 'react-native-elements';
import { scaffolding, colors } from '../../../styles';
import { syncResetAllData } from '../../../stores/actions';
import { updateQuantitySales } from '../../../stores/actions';
import I18n from '../../../i18n/i18n';
import { ActionButton, KyteModal, DetailPage } from '../../common';
import LoadingScreen from '../../common/LoadingScreen';
import { DeleteIcon } from '../../../../assets/images';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

class StoreReset extends Component {
  static navigationOptions = () => ({
    header: null,
  });

  state = {
    storeReseted: false,
    resetConfirmed: false,
    isModalVisible: false,
  };

  setStoreReseted() {
    this.setState({
      storeReseted: true,
      isModalVisible: false
    });
  }

  deleteAlert() {
    const { isOnline } = this.props;
    if (!isOnline) {
      return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [{ text: 'OK' }]);
    }

    Alert.alert(
      I18n.t('eraseTransactionsAlertTitle'),
      I18n.t('eraseTransactionsAlertDescription'),
      [
        { text: I18n.t('alertDismiss') },
        { text: I18n.t('alertConfirm'), onPress: () => this.deleteHistory() },
      ],
    );
  }

  deleteHistory() {
    this.setState({ isModalVisible: true });
    this.props.syncResetAllData(this.setStoreReseted.bind(this));
  }

  toggleResetConfirm() {
    const { resetConfirmed } = this.state;
    this.setState({ resetConfirmed: !resetConfirmed });
  }

  renderStoreResetIcon() {
    const { storeReseted } = this.state;
    const { svgImage, infoStyle } = styles;
    return !storeReseted ? (
      <Image style={svgImage} source={{ uri: DeleteIcon }} />
    ) : (
      <Text style={infoStyle}>{I18n.t('eraseTransactionsSuccess')}</Text>
    );
  }

  renderStoreResetCheckbox() {
    const { storeReseted, resetConfirmed } = this.state;
    const { checkboxText, checkStyles } = styles;

    return (!storeReseted) ? (<CheckBox
        containerStyle={checkStyles}
        checkedIcon={'check-box'}
        uncheckedIcon={'check-box-outline-blank'}
        iconType={'material'}
        onPress={() => this.toggleResetConfirm()}
        checkedColor={colors.actionColor}
        checked={resetConfirmed}
        title={I18n.t('eraseTransactionsCheckMessage')}
        textStyle={checkboxText}
      />
    ) : null;
  }

  render() {
    const { resetConfirmed } = this.state;
    const { bottomContainer } = scaffolding;
    const { topContainer, infoContainer, infoStyle, checkboxContainer, checkboxInner } = styles;
    const { goBack } = this.props.navigation;
    this.state.storeReseted ? this.props.updateQuantitySales() : null;

    return (
      <DetailPage pageTitle={I18n.t('eraseTransactionsPageTitle')} goBack={goBack}>
        <View style={topContainer}>{this.renderStoreResetIcon()}</View>
        <View style={infoContainer}>
          <Text style={infoStyle}>
            {!this.state.storeReseted ? I18n.t('eraseTransactionsInfo') : null}
          </Text>
        </View>
        <View style={checkboxContainer}>
          <TouchableOpacity onPress={() => this.toggleResetConfirm()}>
            <View style={checkboxInner}>{this.renderStoreResetCheckbox()}</View>
          </TouchableOpacity>
        </View>
        <View style={bottomContainer}>
          <ActionButton
            onPress={this.state.storeReseted ? () => goBack() : () => this.deleteAlert()}
            disabledStyle={!resetConfirmed}
            disabled={!resetConfirmed}
            alertDescription={I18n.t('eraseTransactionsCheckAlert')}
          >
            {this.state.storeReseted
              ? I18n.t('eraseTransactionsReturnTitle')
              : I18n.t('eraseTransactionsPageTitle')}
          </ActionButton>
        </View>
        <KyteModal
          fullPage
          height={'100%'}
          hideOnBack={false}
          isModalVisible={this.state.isModalVisible}
        >
          <LoadingScreen reverseColor hideLogo description={I18n.t('deletingScreenMessage')} />
        </KyteModal>
      </DetailPage>
    );
  }
}

const styles = {
  topContainer: {
    flex: 0.7,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: (SMALL_SCREENS) ? 0 : 100,
  },
  infoContainer: {
    flex: 0.3,
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
  },
  infoStyle: {
    fontFamily: 'Graphik-Medium',
    fontSize: (SMALL_SCREENS) ? 12 : 15,
    textAlign: 'center',
    color: colors.primaryColor,
    ...Platform.select({
      ios: { lineHeight: (SMALL_SCREENS) ? 18 : 22 },
      android: { lineHeight: (SMALL_SCREENS) ? 18 : 25 },
    }),
  },
  checkStyles: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 5,
    paddingRight: 5,
  },
  checkboxContainer: {
    height: (SMALL_SCREENS) ? 60 : 100,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { paddingHorizontal: (SMALL_SCREENS) ? 30 : 0 }
    }),
  },
  checkboxInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxText: {
    fontFamily: 'Graphik-Regular',
    color: colors.primaryColor,
    fontWeight: 'normal',
    fontSize: (SMALL_SCREENS) ? 12 : 15,
  },
  svgImage: {
    resizeMode: 'contain',
    width: SMALL_SCREENS ? Dimensions.get('window').width * 0.40 : Dimensions.get('window').width * 0.35,
    height: SMALL_SCREENS ? Dimensions.get('window').width * 0.40 : Dimensions.get('window').height * 0.35,
  },
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(
    {
      syncResetAllData,
      updateQuantitySales,
    },
    dispatch,
  ),
});

export default connect(
  (state) => ({
    isOnline: state.common.isOnline,
  }),
  mapDispatchToProps,
)(StoreReset);
