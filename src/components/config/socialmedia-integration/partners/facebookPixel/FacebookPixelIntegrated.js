/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, Linking, TouchableOpacity, Image, ScrollView, Keyboard } from 'react-native';
import IconDelete from "@react-native-vector-icons/feather";
import { connect } from 'react-redux';
import { KyteText } from '@kyteapp/kyte-ui-components';
import { bindActionCreators } from 'redux';
import { FacebookAndKyte } from '../../../../../../assets/images';
import showModal from '../../utils/showModal';
import I18n from '../../../../../i18n/i18n';
import { colors, scaffolding } from '../../../../../styles';
import {
  ActionButton,
  CustomKeyboardAvoidingView,
  DetailPage,
  Input,
  KyteModal,
  LoadingCleanScreen,
} from '../../../../common';
import renderBoxes from './components/renderBoxes';
import renderModal from '../components/renderModal';
import { renderTip } from '../../utils/renderTip';
import { kyteFacebookPixelIntegration } from '../../../../../services';
import { updateIntegrations } from '../../../../../stores/actions';
import { logEvent } from '../../../../../integrations';

const Strings = {
  PAGE_TITLE: 'Facebook Pixel',

  FACEBOOK_PIXEL_HEADER: I18n.t('facebookPixelHeaderText'),

  FACEBOOK_PIXEL_ID: 'Facebook Pixel ID',

  FACEBOOK_PIXEL_PLACEHOLDER: I18n.t('placeholderFacebookPixel'),

  UNINSTALL_FACEBOOK_PIXEL_BUTTON_LABEL: I18n.t('uninstallIntegrationButtonLabel'),

  TEXT_UNINSTALL_INTEGRATION: I18n.t('uninstallIntegrationFacebookPixelText'),

  BACK_TO_SETTINGS_LABEL: I18n.t('backToSettingsLabel'),
  FACEBOOK_PIXEL_ACCESS_LABEL: I18n.t('facebookPixelAccessLabel'),

  CANCEL_LABEL: I18n.t('alertDismiss'),
  SAVE_CHANGES_TEXT: I18n.t('expressions.saveChanges'),

  TITLE_INTEGRATION_UNINSTALL: I18n.t('uninstalledIntegrationTitle'),
  TEXT_INTEGRATION_UNINSTALL: I18n.t('uninstalledIntegrationText'),

  TITLE_INTEGRATION_UNINSTALL_FAILURE: I18n.t('words.s.error'),
  TEXT_INTEGRATION_UNINSTALL_FAILURE: I18n.t('uninstallFailureIntegrationTtext'),

  TITLE_INTEGRATION_PIXEL_ALTERED: I18n.t('pixelIdAlteredTitle'),
  TEXT_INTEGRATION_PIXEL_ALTERED: I18n.t('pixelIdAlteredText'),

  TITLE_OFFLINE: I18n.t('offlineErrorTitle'),
  TEXT_OFFLINE: I18n.t('offlineErrorText'),
};

function FacebookPixelIntegrated(props) {
  const [showTip, setShowTip] = useState(false);
  const [pixelId, setPixelId] = useState('');
  const [isFocusedInput, setIsFocusedInput] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [contentModal, setContentModal] = useState({
    title: '',
    description: '',
    typeEvent: '',
  });
  const { goBack, navigate } = props.navigation;
  const { aid } = props.auth;
  const { integrations } = props.auth.store;
  const { isOnline } = props;

  const isPixelIntegrated = integrations.find((i) => i.name === 'pixel' && i.active);
  const isFbeIntegrated = integrations.find((i) => i.name === 'fbe');
  const hasFbeIntegrated = isFbeIntegrated && isFbeIntegrated.active;

  useEffect(() => {
    if (hasFbeIntegrated) {
      setPixelId(isFbeIntegrated.value);
    } else {
      setPixelId(isPixelIntegrated.value);
    }

    logEvent('PixelView', { isAlreadyIntegrated: true });
  }, []);

  const urlFacebookManager = 'https://business.facebook.com/events_manager2/';

  const rightButton = [
    { icon: 'help', color: colors.grayBlue, onPress: () => setShowTip(true), iconSize: 20 },
  ];

  const openIntegration = () => Linking.openURL(urlFacebookManager);
  const cancelChanges = () => Keyboard.dismiss();
  const goBackSocialPage = () => navigate('SocialMediaIntegration');

  const showModalOffline = (typeError) => {
    showModal(
      Strings.TITLE_OFFLINE,
      Strings.TEXT_OFFLINE,
      typeError,
      setContentModal,
      setIsModalVisible,
    );
  };

  const saveChanges = async () => {
    setLoading(true);
    setIsModalVisible(false);

    try {
      const { data } = await kyteFacebookPixelIntegration({
        active: true,
        pixelId: pixelId.toString(),
        aid,
      });

      props.updateIntegrations([...data.store.integrations]);

      logEvent('PixelEdit');

      showModal(
        Strings.TITLE_INTEGRATION_PIXEL_ALTERED,
        Strings.TEXT_INTEGRATION_PIXEL_ALTERED,
        'pixelIdAlteredSuccess',
        setContentModal,
        setIsModalVisible,
      );
    } catch (error) {
      isOnline
        ? showModal(
            'Erro',
            'Não foi possível alterar o código do Facebook Pixel ID.',
            'pixelIdAlteredError',
            setContentModal,
            setIsModalVisible,
          )
        : showModalOffline('offlineEditError');
    } finally {
      Keyboard.dismiss();
      setLoading(false);
    }
  };

  const uninstallIntegration = async () => {
    setLoading(true);
    setIsModalVisible(false);

    try {
      const { data } = await kyteFacebookPixelIntegration({
        active: false,
        pixelId: isPixelIntegrated.value,
        aid,
      });

      showModal(
        Strings.TITLE_INTEGRATION_UNINSTALL,
        Strings.TEXT_INTEGRATION_UNINSTALL,
        'uninstallSuccess',
        setContentModal,
        setIsModalVisible,
      );

      logEvent('PixelUninstall');

      props.updateIntegrations([...data.store.integrations]);
    } catch (error) {
      isOnline
        ? showModal(
            Strings.TITLE_INTEGRATION_UNINSTALL_FAILURE,
            Strings.TEXT_INTEGRATION_UNINSTALL_FAILURE,
            'uninstallError',
            setContentModal,
            setIsModalVisible,
          )
        : showModalOffline('offlineUninstallError');
    } finally {
      setLoading(false);
    }
  };

  const handleBehaviorButton = () => {
    if (isFocusedInput) {
      if (pixelId.length < 15) return;

      saveChanges();
    } else {
      openIntegration();
    }
  };

  const renderComponentModal = () => {
    return (
      <KyteModal isModalVisible height="auto">
        {renderModal(
          contentModal.title,
          contentModal.description,
          contentModal.typeEvent,
          setIsModalVisible,
          goBack,
          uninstallIntegration,
          saveChanges,
        )}
      </KyteModal>
    );
  };
  const renderButtons = () => {
    const { bottomContainer } = scaffolding;
    return (
      <View style={[bottomContainer, styles.bottomContainerButtons]}>
        <ActionButton
          cancel
          onPress={isFocusedInput ? cancelChanges : goBackSocialPage}
          style={{ borderColor: '#535D6E' }}
          text={Strings.TUTORIAL_BUTTON_LABEL}
          textStyle={styles.textButton}
        >
          {isFocusedInput ? Strings.CANCEL_LABEL : Strings.BACK_TO_SETTINGS_LABEL}
        </ActionButton>

        <ActionButton
          onPress={handleBehaviorButton}
          textStyle={[styles.textButton, { color: pixelId.length >= 15 ? colors.white : '#aaa' }]}
          style={[
            styles.integrationButton,
            {
              backgroundColor: pixelId.length >= 15 ? colors.actionColor : '#eee',
            },
          ]}
        >
          {isFocusedInput ? Strings.SAVE_CHANGES_TEXT : Strings.FACEBOOK_PIXEL_ACCESS_LABEL}
        </ActionButton>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <KyteText
          color={colors.white}
          size={21.6}
          lineHeight={30.24}
          textAlign="center"
          style={styles.textHeader}
        >
          {Strings.FACEBOOK_PIXEL_HEADER}
        </KyteText>

        <Image source={{ uri: FacebookAndKyte }} style={styles.imgHeader} />
      </View>
    );
  };

  return (
    <DetailPage
      goBack={() => navigate('SocialMediaIntegration')}
      pageTitle={Strings.PAGE_TITLE}
      rightButtons={rightButton}
    >
      <CustomKeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {renderHeader()}
          <View style={{ paddingHorizontal: 20 }}>
            {!hasFbeIntegrated ? (
              <>
                <KyteText size={12.6} color={colors.primaryDarker}>
                  {Strings.FACEBOOK_PIXEL_ID}
                </KyteText>

                <Input
                  placeholder={Strings.FACEBOOK_PIXEL_PLACEHOLDER}
                  hideLabel
                  keyboardType="numeric"
                  value={pixelId}
                  onChangeText={(text) => setPixelId(text)}
                  maxLength={17}
                  onFocus={() => setIsFocusedInput(true)}
                  onBlur={() => setIsFocusedInput(false)}
                  style={styles.inputStyle}
                />

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.buttonUninstall}
                  onPress={() =>
                    showModal(
                      Strings.UNINSTALL_FACEBOOK_PIXEL_BUTTON_LABEL,
                      Strings.TEXT_UNINSTALL_INTEGRATION,
                      '',
                      setContentModal,
                      setIsModalVisible,
                    )
                  }
                >
                  <IconDelete name="trash" size={20} color={colors.barcodeRed} />

                  <KyteText color={colors.barcodeRed} size={13} weight={500} marginLeft={5}>
                    {Strings.UNINSTALL_FACEBOOK_PIXEL_BUTTON_LABEL}
                  </KyteText>
                </TouchableOpacity>
              </>
            ) : null}

            {renderBoxes(isFbeIntegrated, navigate)}
          </View>
        </ScrollView>
        {renderButtons()}
      </CustomKeyboardAvoidingView>

      {renderTip(showTip, setShowTip, 3, isPixelIntegrated)}
      {isModalVisible ? renderComponentModal() : null}
      {isLoading ? <LoadingCleanScreen /> : null}
    </DetailPage>
  );
}

const styles = {
  container: {
    paddingBottom: 50,
  },
  header: {
    backgroundColor: colors.actionColor,
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 32,
  },
  textHeader: {
    maxWidth: 355,
  },
  imgHeader: {
    marginTop: 24,
    width: 120,
    height: 47,
  },
  inputStyle: {
    fontSize: 16.2,
    fontFamily: 'Graphik-Medium',
  },
  buttonUninstall: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  textButton: {
    fontSize: 14.4,
    color: colors.secondaryGrey,
  },
  integrationButton: {
    marginTop: 9,
  },
  bottomContainerButtons: {
    height: 140,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
  },
};

const mapStateToProps = ({ auth, common }) => ({
  auth,
  isOnline: common.isOnline,
});

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    ...bindActionCreators(
      {
        updateIntegrations,
      },
      dispatch,
    ),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FacebookPixelIntegrated);
