/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { View, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import IconExternalLink from "@react-native-vector-icons/evil-icons";
import { KyteText } from '@kyteapp/kyte-ui-components';
import { bindActionCreators } from 'redux';

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
import { renderTip } from '../../utils/renderTip';
import renderModal from '../components/renderModal';
import renderBottonModalCatalogWarning from '../components/renderBottonModalCatalogWarning';
import { kyteFacebookPixelIntegration } from '../../../../../services';
import showModal from '../../utils/showModal';
import { updateIntegrations } from '../../../../../stores/actions';
import { logEvent } from '../../../../../integrations';

const Strings = {
  PAGE_TITLE: 'Facebook Pixel',

  FACEBOOK_PIXEL_ID: 'Facebook Pixel ID',

  FACEBOOK_PIXEL_PLACEHOLDER: I18n.t('placeholderFacebookPixel'),

  FACEBOOK_PIXEL_BUTTON_LABEL: I18n.t('facebookPixelButtonLabel'),

  FACEBOOK_PIXEL_TEXT_1: I18n.t('facebookPixelText1'),
  FACEBOOK_PIXEL_TEXT_2: I18n.t('facebookPixelText2'),

  TUTORIAL_BUTTON_LABEL: I18n.t('fbe.goToCompleteTutorial'),
  FACEBOOK_PIXEL_INTEGRATION_BUTTON_LABEL: I18n.t('facebookPixelIntegrationButtonLabel'),

  TUTORIAL_LINK: I18n.t('facebookPixelTutorialLink'),

  TITLE_INTEGRATION_FAILURE: I18n.t('integrationFailureTitle'),
  TEXT_INTEGRATION_FAILURE: I18n.t('integrationFailureText'),

  TITLE_OFFLINE: I18n.t('offlineErrorTitle'),
  TEXT_OFFLINE: I18n.t('offlineErrorText'),

  LANG: I18n.t('fbIntegration.imageCode'),

  TEXT_MINUMUM_CHARACTERS: I18n.t('minimumOfCharacters'),
};

const FacebookPixel = (props) => {
  const [showTip, setShowTip] = useState(false);
  const [pixelId, setPixelId] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [contentModal, setContentModal] = useState({
    title: '',
    description: '',
    typeEvent: '',
  });

  const { goBack, navigate } = props.navigation;
  const { aid } = props.auth;
  const { isOnline } = props;
  const { catalog = {} } = props.auth.store;
  const { active } = catalog;
  const urlFacebookManager = 'https://business.facebook.com/events_manager2/';

  const rightButton = [
    { icon: 'help', color: colors.grayBlue, onPress: () => setShowTip(true), iconSize: 20 },
  ];

  useEffect(() => {
    logEvent('PixelView', { isAlreadyIntegrated: false });
  }, []);

  const goToTutorial = () => Linking.openURL(Strings.TUTORIAL_LINK);

  const openIntegration = () => Linking.openURL(urlFacebookManager);

  const handleIntegrationFacebookPixel = async () => {
    if (pixelId.length < 15) return;

    setLoading(true);
    setIsModalVisible(false);

    logEvent('PixelStart');

    try {
      const { data } = await kyteFacebookPixelIntegration({
        active: true,
        pixelId: pixelId.toString(),
        aid,
      });

      props.updateIntegrations([...data.store.integrations]);

      logEvent('Pixel Complete');

      navigate('FacebookPixelIntegratedPage');
      setPixelId('');
    } catch (error) {
      isOnline
        ? showModal(
            Strings.TITLE_INTEGRATION_FAILURE,
            Strings.TEXT_INTEGRATION_FAILURE,
            'integrationError',
            setContentModal,
            setIsModalVisible,
          )
        : showModal(
            Strings.TITLE_OFFLINE,
            Strings.TEXT_OFFLINE,
            'offlineError',
            setContentModal,
            setIsModalVisible,
          );
    } finally {
      setLoading(false);
    }
  };

  const renderComponentModal = () => (
      <KyteModal isModalVisible={isModalVisible} height="auto">
        {renderModal(
          contentModal.title,
          contentModal.description,
          contentModal.typeEvent,
          setIsModalVisible,
          goBack,
          () => {},
          handleIntegrationFacebookPixel,
        )}
      </KyteModal>
    );
  const renderTutorialButton = () => (
      <ActionButton
        cancel
        onPress={goToTutorial}
        style={{ borderColor: '#535D6E' }}
        text={Strings.TUTORIAL_BUTTON_LABEL}
        textStyle={styles.textButton}
      >
        {Strings.TUTORIAL_BUTTON_LABEL}
      </ActionButton>
    );

  const renderButtons = () => {
    const { bottomContainer } = scaffolding;

    return (
      <View style={[bottomContainer, { height: 140, backgroundColor: '#FFFFFF' }]}>
        {renderTutorialButton()}
        <ActionButton
          onPress={handleIntegrationFacebookPixel}
          textStyle={[
            styles.textButton,
            { color: !!pixelId && pixelId.length >= 15 ? colors.white : '#aaa' },
          ]}
          style={[
            styles.integrationButton,
            { backgroundColor: !!pixelId && pixelId.length >= 15 ? colors.actionColor : '#eee' },
          ]}
        >
          {Strings.FACEBOOK_PIXEL_INTEGRATION_BUTTON_LABEL}
        </ActionButton>
      </View>
    );
  };

  const renderFacebookPixel = () => (
    <>
      <CustomKeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
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
            style={[
              styles.inputStyle,
              { fontFamily: !!pixelId && pixelId.length ? 'Graphik-Medium' : 'Graphik-Regular' },
            ]}
            editable={active === undefined ? false : active}
          />

          {pixelId.length < 15 ? (
            <KyteText color={colors.primaryDarker} size={10.8}>
              {Strings.TEXT_MINUMUM_CHARACTERS}
            </KyteText>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.buttonExternalLink}
            onPress={openIntegration}
          >
            <IconExternalLink name="external-link" size={26} color={'#2FAE94'} />

            <KyteText color={'#2FAE94'} size={13} weight={500}>
              {Strings.FACEBOOK_PIXEL_BUTTON_LABEL}
            </KyteText>
          </TouchableOpacity>

          <KyteText size={16.2} textAlign="center" lineHeight={24.3}>
            {Strings.FACEBOOK_PIXEL_TEXT_1}{' '}
            <KyteText size={16.2} textAlign="center" weight={500}>
              {Strings.FACEBOOK_PIXEL_ID}
            </KyteText>{' '}
            {Strings.FACEBOOK_PIXEL_TEXT_2}
          </KyteText>
        </ScrollView>
        {renderButtons()}
      </CustomKeyboardAvoidingView>

      {renderTip(showTip, setShowTip, 3)}
      {isModalVisible ? renderComponentModal() : null}
      {isLoading ? <LoadingCleanScreen /> : null}
    </>
  );

  return (
    <DetailPage
      goBack={goBack}
      pageTitle={Strings.PAGE_TITLE}
      rightButtons={active ? rightButton : null}
    >
      {active ? renderFacebookPixel() : renderBottonModalCatalogWarning()}
    </DetailPage>
  );
};

const styles = {
  container: {
    justifyContent: 'center',
    width: '93%',
    height: '91%',
    alignSelf: 'center',
  },

  inputStyle: {
    fontSize: 16.2,
  },

  buttonExternalLink: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 36,
  },

  textButton: {
    fontSize: 14.4,
  },

  integrationButton: {
    marginTop: 9,
  },
};

const mapStateToProps = ({ auth, common }) => ({
  auth,
  isOnline: common.isOnline,
});

const mapDispatchToProps = (dispatch) => ({
    dispatch,
    ...bindActionCreators(
      {
        updateIntegrations,
      },
      dispatch,
    ),
  });

export default connect(mapStateToProps, mapDispatchToProps)(FacebookPixel);
