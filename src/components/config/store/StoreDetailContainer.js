import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { colors } from '../../../styles';
import {
  DetailPage,
  ActionButton,
  CustomKeyboardAvoidingView,
  LoadingCleanScreen,
} from '../../common';
import StoreForm from './StoreForm';
import I18n from '../../../i18n/i18n';
import { storeAccountSave } from '../../../stores/actions';
import { logEvent } from '../../../integrations';

class StoreDetailContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shrinkSection: false
    };
  }

  toggleShrinkSection() {
    this.setState({ shrinkSection: !this.state.shrinkSection });
  }

  saveStore() {
    const { form, imageSet, navigation } = this.props;
    const { goBack } = navigation;
    const { ...formValues } = form.values;
    const store = {
      ...formValues,
      phone: formValues.phone ? `+${formValues.phone.replace(' ', '').replace('+', '')}` : null,
      whatsapp: formValues.whatsapp
        ? `+${formValues.whatsapp.replace(' ', '').replace('+', '')}`
        : null,
      image: imageSet,
    };

    logEvent('Store Data Config Save')

    this.props.storeAccountSave(store, () => goBack());
  }

  renderLoader() {
    return <LoadingCleanScreen />;
  }

  render() {
    const { goBack } = this.props.navigation;
    const { topContainer, buttonContainer } = styles;
    const { form } = this.props;
    const { visible } = this.props.loader;

    return (
      <DetailPage
        pageTitle={I18n.t('configMenus.storeInfo')}
        goBack={goBack}
      >
        <CustomKeyboardAvoidingView style={{ flex: 1 }}>
          <View style={topContainer}>
            <StoreForm toggleShrinkSection={() => this.toggleShrinkSection()} navigation={this.props.navigation} />
          </View>
          <View style={buttonContainer}>
            <ActionButton
              onPress={() => this.saveStore()}
              disabled={form && form.syncErrors}
              alertTitle={I18n.t('words.s.attention')}
              alertDescription={I18n.t('errorInField')}
            >
              {I18n.t('storeInfoSaveButton')}
            </ActionButton>
          </View>
        </CustomKeyboardAvoidingView>
        {visible ? this.renderLoader() : null}
      </DetailPage>
    );
  }

}

const styles = {
  topContainer: {
    flex: 1,
    backgroundColor: colors.drawerIcon,
  },
  buttonContainer: {
    height: 70,
    paddingVertical: 10,
  },
};

const mapStateToProps = (state) => ({
  userPermissions: state.auth.user.permissions,
  user: state.auth.user,
  form: state.form.ConfigStoreForm,
  imageSet: state.auth.store.imageSet,
  storeDetail: state.auth.store,
  loader: state.common.loader,
});

export default connect(mapStateToProps, { storeAccountSave })(StoreDetailContainer);
