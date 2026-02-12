import React, { useEffect, useState } from 'react';
import { ScrollView, Linking } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as RNLocalize from 'react-native-localize';

import { kyteTikTokIntegration } from '../../../../../services';
import { DetailPage, LoadingCleanScreen, KyteAlertV2 } from '../../../../common';
import I18n from '../../../../../i18n/i18n';
import { tikTokUninstall, tikTokInstall, storeAccountSave } from '../../../../../stores/actions';
import { emailValidate } from '../../../../../util';
import { renderTip } from '../../utils/renderTip';
import { colors } from '../../../../../styles';
import { logEvent } from '../../../../../integrations';
import {
  ButtonBottom,
  CatalogInfo,
  ContentIntro,
  Header,
  HeaderIntegrated,
  InfoAccount,
  LoadingComponent,
  ModalMoreInfo,
  TiktokInfo,
} from './parts';

const TiktokPage = ({ ...props }) => {
  const { navigation, route, auth } = props;

  const [isLoading, setLoading] = useState(false);
  const [isIntegrated, setIsIntegrated] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [contentModal, setContentModal] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVisibleModalMoreInfo, setIsVisibleModalMoreInfo] = useState(false);
  const [active, setActive] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const { catalog = {}, integrations = [] } = auth.store;
  const rightButton = [
    { icon: 'help', color: colors.grayBlue, onPress: () => setShowTip(true), iconSize: 20 },
  ];

  const Strings = {
    TITLE_INTEGRATION_UNINSTALL: I18n.t('tiktok.uninstalledIntegrationTitle'),
    TEXT_INTEGRATION_UNINSTALL: I18n.t('tiktok.uninstalledIntegrationText'),

    TITLE_INTEGRATION_UNINSTALL_FAILURE: I18n.t('words.s.error'),
    TEXT_INTEGRATION_UNINSTALL_FAILURE: I18n.t('tiktok.uninstallFailureIntegrationTtext'),

    TITLE_CATALOG_INFO: I18n.t('fbe.infoCatalogTitle'),
    TEXT_CATALOG_INFO: I18n.t('fbe.textCatalogInfo'),
    CATALOG_BUTTON_LABEL: I18n.t('fbe.goToCatalogConfig'),
  };

  const installTikTokIntegration = async (auth_code) => {
    setLoading(true);

    try {
      await props.tikTokInstall(auth_code);
    } catch (ex) {
      console.log(ex);
    } finally {
      logEvent('TiktokComplete');
      setLoading(false);
    }
  };

  const uninstallTikTokIntegration = async () => {
    const baseModal = {
      labelButton: I18n.t('alertOk'),
      actionButton: () => navigation.goBack(),
    };

    setIsModalVisible(false);
    setLoading(true);

    try {
      await props.tikTokUninstall(
        () => {
          setContentModal({
            ...baseModal,
            title: Strings.TITLE_INTEGRATION_UNINSTALL,
            description: Strings.TEXT_INTEGRATION_UNINSTALL,
            oneButton: true,
          });
        },
        () => {
          setContentModal({
            ...baseModal,
            title: Strings.TITLE_INTEGRATION_UNINSTALL_FAILURE,
            description: Strings.TEXT_INTEGRATION_UNINSTALL_FAILURE,
          });
        },
      );
    } catch (ex) {
      setContentModal({
        ...baseModal,
        title: Strings.TITLE_INTEGRATION_UNINSTALL_FAILURE,
        description: Strings.TEXT_INTEGRATION_UNINSTALL_FAILURE,
      });
    } finally {
      logEvent('TiktokUninstall');
      setLoading(false);
      setIsModalVisible(true);
    }
  };

  const openTikTokIntegration = async () => {
    isVisibleModalMoreInfo && toggleModalMoreInfo();
    setLoading(true);

    const { data } = await kyteTikTokIntegration(auth.aid, RNLocalize.getTimeZone());
    Linking.openURL(data).then(() => {
      setLoading(false);
    });
  };

  const toggleModalMoreInfo = () => {
    setIsVisibleModalMoreInfo(!isVisibleModalMoreInfo);
  };

  const modalOrIntegration = async () => {
    const validaEmailStore = emailValidate({ email: auth.store.email });
    const validaEmailUser = emailValidate({ email: auth.user.email });

    (auth.store.email || auth.user.email) &&
    (auth.store.phone || auth.user.phone) &&
    (auth.store.phone.length >= 3 || auth.user.phone.length >= 3) &&
    (Object.keys(validaEmailStore).length === 0 || Object.keys(validaEmailUser).length === 0)
      ? (await props.storeAccountSave(
          {
            ...auth.store,
            phone: `+${(auth.store.phone || auth.user.phone).replace(/\s/g, '').replace('+', '')}`,
            email: auth.store.email || auth.user.email,
          },
          openTikTokIntegration(),
        ),
        openTikTokIntegration())
      : toggleModalMoreInfo();
  };

  useEffect(() => {
    catalog.active && setActive(catalog.active);
    !!integrations && setIsIntegrated(!!integrations.find((i) => i.name === 'tiktok' && i.active));
    integrations && setPageLoading(false);
  }, [catalog, integrations, auth.store.integrations]);

  useEffect(() => {
    logEvent('TiktokView');
    !!route?.params?.auth_code && !isIntegrated && installTikTokIntegration(route.params.auth_code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DetailPage goBack={navigation.goBack} pageTitle="TikTok Business" rightButtons={rightButton}>
      {pageLoading ? (
        <LoadingComponent />
      ) : (
        <>
          <ScrollView>
            {isIntegrated ? <HeaderIntegrated /> : <Header />}

            {!isIntegrated ? (
              <TiktokInfo />
            ) : (
              <>
                <ContentIntro
                  setContentModal={setContentModal}
                  setIsModalVisible={setIsModalVisible}
                  uninstall={uninstallTikTokIntegration}
                />

                <InfoAccount aid={auth.aid} />
              </>
            )}
          </ScrollView>

          {!active ? (
            <CatalogInfo
              title={Strings.TITLE_CATALOG_INFO}
              text={Strings.TEXT_CATALOG_INFO}
              label={Strings.CATALOG_BUTTON_LABEL}
              navigate={() => navigation.navigate('OnlineCatalog')}
            />
          ) : (
            <ButtonBottom
              isIntegrated={isIntegrated}
              navigation={navigation}
              toggleModalMoreInfo={modalOrIntegration}
              aid={auth.aid}
            />
          )}

          <ModalMoreInfo
            toggleModalMoreInfo={() => toggleModalMoreInfo()}
            isVisibleModalMoreInfo={isVisibleModalMoreInfo}
            storeAccountSave={(event) => props.storeAccountSave(event, openTikTokIntegration())}
            auth={auth}
          />

          {renderTip(showTip, setShowTip, 4, isIntegrated)}

          {isLoading && <LoadingCleanScreen />}

          <KyteAlertV2
            hideModal={() => setIsModalVisible(!isModalVisible)}
            isModalVisible={isModalVisible}
            contentModal={contentModal}
          />
        </>
      )}
    </DetailPage>
  );
};

const mapStateToProps = ({ auth }) => ({
  auth,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(
    {
      tikTokUninstall,
      tikTokInstall,
      storeAccountSave,
    },
    dispatch,
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(TiktokPage);
