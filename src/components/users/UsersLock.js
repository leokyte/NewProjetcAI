import React, { Component } from 'react';
import {
  Platform,
  View,
  Text,
  StatusBar,
  BackHandler
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import { KyteList, KyteSafeAreaView } from '../common';
import { updateDrawerVisibility } from '../../stores/actions';
import { colors, scaffolding, Type, colorSet } from '../../styles';
import I18n from '../../i18n/i18n';
import { generateTestID } from '../../util';

import { logEvent } from '../../integrations';

class UsersLock extends Component {
  constructor(props) {
    super(props);

    const { multiUsers } = props.auth;
    this.state = {
      users: multiUsers || [],
      isModalVisible: true
    };
  }

  UNSAFE_componentWillMount() {
    this.BackHandlerListener = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backPressEvent.bind(this)
    );
    this.props.updateDrawerVisibility(false);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.auth.multiUsers, this.state.multiUsers)) {
      this.setState({ users: nextProps.auth.multiUsers });
    }
  }

  componentWillUnmount() {
    this.BackHandlerListener.remove();
  }

  backPressEvent() {
    return true;
  }

  blockScreen(user) {
    const { navigate } = this.props.navigation;
    logEvent('BlockApp', { email: user.email });
    navigate('UsersLockPassword', { origin: 'users-lock', user: { displayName: user.title, psw: user.psw, uid: user.uid, email: user.email } });
  }

  renderUserList() {
    const { users } = this.state;
    let data = [];
    if (users) {
      users.forEach(eachUser => {
        if (!eachUser.active) {
          return;
        }

        data.push({
          title: eachUser.displayName,
          leftContent: eachUser.displayName,
          uid: eachUser.uid,
          active: eachUser.active,
          psw: eachUser.psw,
          email: eachUser.email,
          badgeColor: colors.actionColor
        });
      });
    }
    return (<KyteList data={data} onItemPress={(user => this.blockScreen(user))} testProps={generateTestID('user-list-su')} />);
  }

  renderTopV2() {
    const { store, user } = this.props.auth;
    const topHeight = 100;

    const renderPart = (backgroundColor, backgroundColorCircle) => (
      <View style={{ flex: 1 }}>
        <View style={{ width: '100%', height: topHeight, backgroundColor }} />
        <View
          style={{
            borderBottomLeftRadius: 80,
            borderBottomRightRadius: 80,
            height: 50,
            backgroundColor: backgroundColorCircle
          }}
        />
      </View>
    );

    const renderOddPart = () => renderPart(colors.secondaryBg, colors.statusBarColor);
    const renderEvenPart = () => renderPart(colors.primaryBg, colors.secondaryBg);

    return (
      <View style={{ flexDirection: 'row' }}>
        {renderOddPart()}
        {renderEvenPart()}
        {renderOddPart()}
        {renderEvenPart()}
        {renderOddPart()}
        {renderEvenPart()}
        <View style={{ position: 'absolute', width: '100%', alignItems: 'center', justifyContent: 'center', height: topHeight }}>
          <Text style={[Type.SemiBold, Type.fontReSize(22), { color: 'white', textAlign: 'center' }]}  {...generateTestID('store-su')}>
            {store.name || user.displayName}
          </Text>
        </View>
      </View>
    );
  }

  render() {
    const { outerContainer } = scaffolding;
    const { userContainer, infoContainer } = styles;
    return (
      <KyteSafeAreaView style={outerContainer}>
        <StatusBar
          backgroundColor="#F2F3F4"
          barStyle={Platform.OS === 'ios' ? 'default' : 'dark-content'}
        />
        {this.renderTopV2()}
        <View style={userContainer}>
           {this.renderUserList()}
        </View>
        <View style={infoContainer}>
          <Text style={[Type.Regular, Type.fontReSize(13), colorSet(colors.grayBlue)]}>{I18n.t('userLockSelectYourUserToLogIn')}</Text>
        </View>
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  userContainer: {
    flex: 1,
    paddingTop: 25
  },
  infoContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 25
  },
};

export default connect(
  state => ({
    auth: state.auth,
  }), { updateDrawerVisibility })(UsersLock);
