import React, { useState, useEffect } from 'react';
import { ScrollView, View, Linking } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';
import { connect } from 'react-redux';
import IconFacebook from "@react-native-vector-icons/evil-icons";

import I18n from '../../../../../i18n/i18n';

import { ActionButton, DetailPage, KyteModal, LoadingCleanScreen } from '../../../../common';

import renderHeader from './renderHeader';
import showModal from '../../utils/showModal';
import renderContentIntro from './renderContentIntro';
import renderBox from './renderBox';
import renderAlert from './renderAlert';
import renderModal from '../components/renderModal';

import { colors } from '../../../../../styles';

import { renderTip } from '../../utils/renderTip';

import { FbeOrderFood, FbeStoriesInstagram, FbeMessenger } from '../../../../../../assets/images';
import { generateFBEIntegrationURI } from '../../../../../integrations/Facebook/fbe';
import { logEvent } from '../../../../../integrations';
import { bindActionCreators } from 'redux';
import { facebookFBEUninstall } from '../../../../../stores/actions';
import renderBottonModalCatalogWarning from '../components/renderBottonModalCatalogWarning';

const Strings = {
  PAGE_TITLE: I18n.t('fbePageTitle'),

  LANG: I18n.t('fbIntegration.imageCode'),

  TUTORIAL_LINK: I18n.t('fbeTutorialLink'),

  TITLE_BOX_1: I18n.t('fbe.integrationPossibilitiesTitle1'),
  SUBTITLE_BOX_1: I18n.t('fbe.integrationPossibilitiesSubtitle1'),

  TITLE_BOX_2: I18n.t('fbe.integrationPossibilitiesTitle2'),
  SUBTITLE_BOX_2: I18n.t('fbe.integrationPossibilitiesSubtitle2'),

  TITLE_BOX_3: 'Facebook Pixel',
  SUBTITLE_BOX_3: I18n.t('fbe.integrationPossibilitiesSubtitle3'),

  TITLE_BOX_4: I18n.t('fbe.integrationPossibilitiesTitle1'),
  SUBTITLE_BOX_4: I18n.t('fbe.integrationPossibilitiesSubtitle4'),

  TUTORIAL_BUTTON_LABEL: I18n.t('fbe.goToCompleteTutorial'),
  FACEBOOK_BUTTON_LABEL: I18n.t('facebookButtonLabel'),

  TITLE_CATALOG_INFO: I18n.t('fbe.infoCatalogTitle'),
  TEXT_CATALOG_INFO: I18n.t('fbe.textCatalogInfo'),
  CATALOG_BUTTON_LABEL: I18n.t('fbe.goToCatalogConfig'),

  TITLE_DOUBTS: I18n.t('doubtsTitle'),
  DOUBTS_BUTTON_LABEL: I18n.t('doubtsButtonLabel'),

  TITLE_INTEGRATION_UNINSTALL: I18n.t('uninstalledIntegrationTitle'),
  TEXT_INTEGRATION_UNINSTALL: I18n.t('uninstalledIntegrationText'),

  TITLE_INTEGRATION_UNINSTALL_FAILURE: I18n.t('words.s.error'),
  TEXT_INTEGRATION_UNINSTALL_FAILURE: I18n.t('uninstallFailureIntegrationTtext'),
};

const items = [
  {
    title: Strings.TITLE_BOX_1,
    subtitle: Strings.SUBTITLE_BOX_1,
    image: FbeOrderFood(Strings.LANG),
    styleImage: { width: 320, height: 164 },
  },
  {
    title: Strings.TITLE_BOX_2,
    subtitle: Strings.SUBTITLE_BOX_2,
    image: FbeStoriesInstagram(Strings.LANG),
    styleImage: { width: 220, height: 145, marginBottom: -50 },
  },
  {
    title: Strings.TITLE_BOX_3,
    subtitle: Strings.SUBTITLE_BOX_3,
  },
  {
    title: Strings.TITLE_BOX_4,
    subtitle: Strings.SUBTITLE_BOX_4,
    image: FbeMessenger(Strings.LANG),
    styleImage: { width: 279, height: 288 },
  },
];

const FBE = (props) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [contentModal, setContentModal] = useState({
    title: '',
    description: '',
    typeEvent: '',
  });
  const [showTip, setShowTip] = useState(false);

  const { goBack, navigate } = props.navigation;
  const { catalog = {}, integrations = [] } = props.auth.store;
  const { active } = catalog;
  const { auth, currency } = props;

  const isFbeIntegrated = integrations.find((i) => i.name === 'fbe' && i.active);

  useEffect(() => {
    logEvent('FBEFoodView', { isAlreadyIntegrated: !!isFbeIntegrated });
  }, []);

  const goToTutorial = () => Linking.openURL(Strings.TUTORIAL_LINK);

  const uninstallIntegration = async () => {
    setIsModalVisible(false);
    setLoading(true);

    try {
      // Update on 09/02/2022
      // Facebook's QA rejected the app because uninstall button isnt disappearing
      // This happens because Kyte is waiting for the webhook to fire a notification
      // updating the `auth.store` reducer.
      // Because of this I'm forcing the update before the webhook.

      await props.facebookFBEUninstall(
        () => {
          showModal(
            Strings.TITLE_INTEGRATION_UNINSTALL,
            Strings.TEXT_INTEGRATION_UNINSTALL,
            'uninstallSuccess',
            setContentModal,
            setIsModalVisible,
          );
          logEvent('FBEFoodUninstall');
        },
        () =>
          showModal(
            Strings.TITLE_INTEGRATION_UNINSTALL_FAILURE,
            Strings.TEXT_INTEGRATION_UNINSTALL_FAILURE,
            'uninstallError',
            setContentModal,
            setIsModalVisible,
          ),
      );
    } catch (ex) {
      showModal(
        Strings.TITLE_INTEGRATION_UNINSTALL_FAILURE,
        Strings.TEXT_INTEGRATION_UNINSTALL_FAILURE,
        'uninstallError',
        setContentModal,
        setIsModalVisible,
      );
    } finally {
      setLoading(false);
    }
  };

  const openIntegration = () => {
    const timezone = 'America/Sao_Paulo';
    const catalog_url = `https://${auth.store.urlFriendly}.kyte.site`;
    const store_name = auth.store.name;

    const generateParams = {
      aid: auth.aid,
      timezone,
      currency,
      store_name,
      url: catalog_url,
    };
    const generatedURI = generateFBEIntegrationURI(generateParams);

    setLoading(true);
    return Linking.openURL(generatedURI).then(() => {
      logEvent('FBEFoodStart');
      setLoading(false);
    });
  };

  const renderButtons = () => {
    return (
      <View style={styles.containerFooter}>
        <ActionButton
          cancel
          onPress={goToTutorial}
          style={styles.tutorialButton}
          text={Strings.TUTORIAL_BUTTON_LABEL}
          textStyle={styles.textButtonOutline}
        >
          {Strings.TUTORIAL_BUTTON_LABEL}
        </ActionButton>

        <ActionButton
          onPress={openIntegration}
          leftIcon={<IconFacebook name={'sc-facebook'} size={32} color={colors.white} />}
          color="#3876da"
          nextArrow
          textStyle={styles.textButtonFacebook}
        >
          {Strings.FACEBOOK_BUTTON_LABEL}
        </ActionButton>
      </View>
    );
  };

  const renderDoubts = () => {
    return (
      <View style={styles.containerFooter}>
        <KyteText size={14} color={colors.secondaryGrey} textAlign="center" marginBottom={9}>
          {Strings.TITLE_DOUBTS}
        </KyteText>

        <ActionButton
          onPress={() => navigate('Helpcenter')}
          textStyle={styles.textButtonOutline}
          cancel
        >
          {Strings.DOUBTS_BUTTON_LABEL}
        </ActionButton>
      </View>
    );
  };

  const renderContent = () => {
    return (
      <DetailPage goBack={goBack} pageTitle={Strings.PAGE_TITLE} rightButtons={rightButton}>
        <ScrollView>
          {renderHeader(isFbeIntegrated)}
          {renderContentIntro(isFbeIntegrated, setContentModal, setIsModalVisible)}
          {items.map((item, index) =>
            renderBox(item.title, item.subtitle, item.image, item.styleImage, index),
          )}

          {!isFbeIntegrated && active ? renderAlert() : null}
        </ScrollView>

        {active && !isFbeIntegrated ? renderButtons() : null}

        {!active ? renderBottonModalCatalogWarning() : null}

        {isFbeIntegrated ? renderDoubts() : null}

        <KyteModal isModalVisible={isModalVisible} height="auto">
          {renderModal(
            contentModal.title,
            contentModal.description,
            contentModal.typeEvent,
            setIsModalVisible,
            navigate,
            uninstallIntegration,
          )}
        </KyteModal>

        {renderTip(showTip, setShowTip, 2, isFbeIntegrated)}
        {isLoading ? <LoadingCleanScreen /> : null}
      </DetailPage>
    );
  };

  const rightButton = [
    { icon: 'help', color: colors.grayBlue, onPress: () => setShowTip(true), iconSize: 20 },
  ];

  return renderContent();
};

const styles = {
  containerHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  imgHeader: {
    width: 320,
    height: 180,
  },
  socialNetworks: {
    width: 193,
    height: 47,
    marginBottom: 22,
    marginTop: 7,
  },
  containerFooter: {
    width: '100%',
    backgroundColor: colors.white,
    zIndex: 1,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.littleDarkGray,
  },
  tutorialButton: {
    marginBottom: 7,
  },
  buttonCatalog: {
    marginBottom: 16,
  },
  textButtonCatalog: {
    color: colors.white,
    fontSize: 16,
  },
  textButtonOutline: {
    color: colors.secondaryGrey,
    fontSize: 14,
  },
  textButtonFacebook: {
    fontSize: 14,
  },
};

const mapStateToProps = ({ auth, preference }) => ({
  auth,
  currency: preference.account.currency.currencyCode || 'USD',
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(
    {
      facebookFBEUninstall,
    },
    dispatch,
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(FBE);
