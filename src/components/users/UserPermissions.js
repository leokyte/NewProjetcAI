import React, { Component } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import _ from 'lodash';
import { KyteButton, KyteIcon, KyteModal, KyteText, Tip } from '../common';
import { colors, scaffolding } from '../../styles';
import { UserPermission } from '../../enums';
import { KyteSwitch, Container } from '@kyteapp/kyte-ui-components';

class UserPermissions extends Component {
  static navigationOptions = () => {
    return {
      header: null
    };
  };

  constructor(props) {
    super(props);
    const { permissions, isOwner } = this.props;

    this.state = {
      tipType: null,
      onPressTip: false,
      isModalVisible: false,
      modalTitle: '',
      currentPermissions: permissions,
      isOwner,
      userName: props.initialValues.name
    };
  }

  renderTip() {
    const { isOwner, tipType, onPressTip } = this.state;
    const { formType } = this.props;

    const permissionTip = this.getPermission(tipType, UserPermission.itemsWithTip);

    return (
      <Tip
        text={permissionTip.getDescription(this.state.userName)}
        observation={permissionTip.getObservation()}
        image={permissionTip.getImageName()}
        type={tipType}
        btnText={permissionTip.getButtonText()}
        showButton={!(isOwner && formType === 'Edit')}
        onPress={() => { onPressTip(); this.setState({ isModalVisible: false }); }}
      />
    );
  }

  showTip(permissionType) {
    const currentPermission = this.getPermission(permissionType);
    const permissionWithType = this.getPermission(permissionType, UserPermission.itemsWithTip);
    this.setState({
      isModalVisible: true,
      modalTitle: permissionWithType.getTitle(),
      tipType: permissionType,
      onPressTip: () => {
        if (!currentPermission.value) {
          this.changePermission(permissionType, true);
        }
      }
    });
  }

  getPermission(permissionType, permissions = null) {
    return _.find(permissions || this.state.currentPermissions, permission => permission.type === permissionType);
  }

  changePermission(permissionType) {
    const { currentPermissions, isOwner } = this.state;
    const adminPermission = this.getPermission(UserPermission.ADMIN);
    if (isOwner) {
      return;
    }

    if (permissionType === UserPermission.ADMIN) {
      const newPermissions = currentPermissions.map(permission => ({ ...permission, value: !adminPermission.value }));
      this.setState({ currentPermissions: newPermissions }, () => this.props.changeUserPermission(newPermissions));
      return;
    } else if (adminPermission.value) {
      return;
    }

    const permissionIndex = _.findIndex(currentPermissions, permission => permission.type === permissionType);
    currentPermissions[permissionIndex] = { ...this.getPermission(permissionType), value: !this.getPermission(permissionType).value };
    this.setState({ currentPermissions }, () => this.props.changeUserPermission(currentPermissions));
  }

  changePermissionWithTip(permissionType) {
    const permission = this.getPermission(permissionType);
    const permissionWithType = this.getPermission(permissionType, UserPermission.itemsWithTip);
    if (permission.value) {
      this.changePermission(permissionType);
      return;
    }
    this.setState({ isModalVisible: true, modalTitle: permissionWithType.getTitle(), tipType: permissionType, onPressTip: () => this.changePermission(permissionType) });
  }

  renderPermissions() {
    const { permissionsContainer, eachPermissionContainer, eachPermissionTextContainer, eachPermissionSwitchContainer } = styles;
    const { isOwner } = this.state;
    const isAdmin = this.getPermission(UserPermission.ADMIN).value;

    const renderTip = (tipAction) => {
      const { iconHelpFilled } = styles;
      return (
        <KyteButton
          width={30}
          height={30}
          onPress={tipAction}
          style={iconHelpFilled}
        >
          <KyteIcon name={'help-filled'} size={18} color={colors.grayBlue} />
        </KyteButton>
      );
    };

    return (
      <ScrollView contentContainerStyle={permissionsContainer}>
        {
          UserPermission.items
          .map((permission, index) => (
            <TouchableOpacity
              key={index}
              onPress={permission.hasTip ? () => this.changePermissionWithTip(permission.type) : () => this.changePermission(permission.type)}
              style={eachPermissionContainer}
            >
              <View style={eachPermissionTextContainer}>
                <KyteText weight="SemiBold" size={14} style={{ opacity: (isOwner) || (permission.type !== UserPermission.ADMIN && isAdmin) ? 0.4 : 1 }}>
                  {permission.text}
                </KyteText>
                {permission.hasTip ? renderTip(() => this.showTip(permission.type)) : null}
              </View>
              <View style={eachPermissionSwitchContainer}>
                <KyteSwitch
                  onValueChange={permission.hasTip ? () => this.changePermissionWithTip(permission.type) : () => this.changePermission(permission.type)}
                  active={this.getPermission(permission.type).value}
                  disabled={isOwner || (permission.type !== UserPermission.ADMIN && isAdmin)}
                />
              </View>
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    );
  }

  renderTipModal() {
    return (
      <KyteModal
        height="100%"
        fullPage
        fullPageTitle={this.state.modalTitle}
        fullPageTitleIcon="back-navigation"
        hideOnBack
        hideFullPage={() => this.setState({ isModalVisible: false })}
        isModalVisible
      >
        <View style={{ flex: 1 }}>
          {this.renderTip()}
        </View>
      </KyteModal>
    );
  }

  render() {
    const { outerContainer } = scaffolding;
    const { innerSection } = styles;
    const { isModalVisible } = this.state;

    return (
      <Container style={outerContainer}>
        <View style={innerSection}>
          {this.renderPermissions()}
        </View>
        {isModalVisible ? this.renderTipModal() : null}
      </Container>
    );
  }
}

const styles = {
  innerSection: {
    flex: 1,
  },
  permissionsContainer: {
    justifyContent: 'flex-start',
    paddingTop: 5,
    marginBottom: 10
  },
  eachPermissionContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.borderlight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 60
  },
  eachPermissionTextContainer: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  eachPermissionSwitchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  iconHelpFilled: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  }
};

export default UserPermissions;
